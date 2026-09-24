const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Determine if we are in development mode
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Start the Express backend server (server.js)
try {
  require('./server.js');
  console.log('Express backend server loaded successfully in Electron main process.');
} catch (error) {
  console.error('Failed to load backend server:', error);
}

// Global exception and rejection handlers to prevent Electron main process crash
process.on('uncaughtException', (err) => {
  console.error('CRITICAL: Uncaught Exception in Electron main process:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL: Unhandled Promise Rejection in Electron main process:', reason);
});

function createWindow() {
  // Resolve icon path — works both in dev and in packaged app
  const iconPath = path.join(__dirname, 'build', 'icon.ico');

  const win = new BrowserWindow({
    width: 1366,
    height: 768,
    icon: iconPath,   // Sets taskbar icon + window frame icon
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: 'AR Shinwari Hujra POS',
  });

  // Hide the default menu bar for a clean desktop-app feel
  win.setMenuBarVisibility(false);
  win.maximize();

  // Security: Restrict navigation to local trusted resources
  win.webContents.on('will-navigate', (event, url) => {
    try {
      const parsedUrl = new URL(url);
      if (
        parsedUrl.protocol !== 'file:' && 
        parsedUrl.host !== 'localhost:5173' && 
        parsedUrl.host !== '127.0.0.1:5173'
      ) {
        event.preventDefault();
        console.warn(`Blocked security-critical navigation attempt to: ${url}`);
      }
    } catch (e) {
      event.preventDefault();
      console.warn(`Blocked invalid navigation attempt: ${url}`);
    }
  });

  // Security: Prevent new windows from being opened via window.open / target="_blank"
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.includes('/api/settings/backup')) {
      const { shell } = require('electron');
      shell.openExternal(url).catch(err => {
        console.error('Failed to open external link:', err);
      });
      return { action: 'deny' };
    }
    console.warn(`Blocked security-critical window open attempt: ${url}`);
    return { action: 'deny' };
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, 'frontend/dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Clean database connection closure on quit to prevent SQLite data corruption
app.on('before-quit', async (event) => {
  console.log('App is quitting. Closing database connection...');
  try {
    const db = require('./database');
    if (typeof db.close === 'function') {
      await db.close();
    }
  } catch (err) {
    console.error('Failed to close database during shutdown:', err);
  }
});

// Handle IPC requests to get the list of system printers
ipcMain.handle('get-printers', async () => {
  const allWins = BrowserWindow.getAllWindows();
  if (allWins.length > 0) {
    return await allWins[0].webContents.getPrintersAsync();
  }
  return [];
});

// Thread-safe print queue to prevent overlapping jobs
let printQueue = Promise.resolve();

// Global print worker window to speed up printing
let globalPrintWorker = null;

function getPrintWorker() {
  return new Promise((resolve) => {
    if (globalPrintWorker && !globalPrintWorker.isDestroyed()) {
      resolve(globalPrintWorker);
      return;
    }

    globalPrintWorker = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    globalPrintWorker.loadURL('about:blank');
    globalPrintWorker.webContents.once('did-finish-load', () => {
      resolve(globalPrintWorker);
    });
  });
}

// Inner execution helper for printing
const executePrintTask = async (html, printerName, paperSize, printSettings) => {
  return new Promise(async (resolve) => {
    let timeout = null;
    let tempPath = null;
    try {
      const workerWin = await getPrintWorker();

      timeout = setTimeout(() => {
        resolve({ success: false, error: 'TIMEOUT' });
      }, 15000);

      // Write receipt HTML to a temporary file in user data folder to prevent URL size/encoding limitations
      tempPath = path.join(app.getPath('userData'), 'temp_receipt.html');
      fs.writeFileSync(tempPath, html, 'utf-8');
      await workerWin.loadFile(tempPath);

      // Wait for all images (like the logo) to load fully and let layout settle
      await workerWin.webContents.executeJavaScript(`
        new Promise((resolve) => {
          const checkImages = () => {
            const imgs = Array.from(document.images);
            const loaded = imgs.every(img => img.complete && img.naturalHeight !== 0);
            if (loaded) {
              setTimeout(resolve, 50);
            } else {
              setTimeout(checkImages, 35);
            }
          };
          if (document.readyState === 'complete') {
            checkImages();
          } else {
            window.addEventListener('load', checkImages);
          }
        });
      `);

      const config = printSettings || {};

      const printOptions = {
        silent: true,
        printBackground: true,
        preferCSSPageSize: true, // Crucial for layout styles to be parsed
        margins: {
          marginType: 'custom',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0
        }
      };

      if (printerName && printerName !== 'System Default') {
        printOptions.deviceName = printerName;
      }

      if (config.copies) {
        printOptions.copies = parseInt(config.copies) || 1;
      }

      if (paperSize === 'A4') {
        printOptions.pageSize = 'A4';
        printOptions.margins = { marginType: 'default' };
      } else {
        // Calculate width in microns
        let widthMm = 80;
        if (paperSize === '58mm') {
          widthMm = 58;
        } else if (paperSize === 'Custom') {
          widthMm = parseInt(config.customWidth) || 80;
        }
        const widthMicrons = widthMm * 1000;

        // Query full document height dynamically (scrollHeight/offsetHeight accounts for entire printable canvas)
        const heightPx = await workerWin.webContents.executeJavaScript(`
          (() => {
            return Math.max(
              document.body.scrollHeight,
              document.documentElement.scrollHeight,
              document.body.offsetHeight,
              document.documentElement.offsetHeight
            );
          })()
        `);

        // Convert pixels to microns (1px = 264.58 microns). Ensure minimum content height.
        // Margins/paddings are already rendered inside .thermal-receipt in HTML, so we measure them directly.
        const contentHeightMicrons = Math.ceil(Math.max(heightPx || 150, 100) * 264.58);

        // Sum everything together plus a 12mm safety buffer to prevent edge cutoffs or premature roll cuts
        const heightMicrons = contentHeightMicrons + 12000;
        
        printOptions.pageSize = { width: widthMicrons, height: heightMicrons };
      }

      workerWin.webContents.print(printOptions, async (success, errorType) => {
        if (timeout) clearTimeout(timeout);
        // Clear document for next print safely
        try {
          await workerWin.loadURL('about:blank');
        } catch(e){}
        // Clean up temporary file
        try {
          if (tempPath && fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
          }
        } catch(e){}
        if (success) {
          resolve({ success: true });
        } else {
          resolve({ success: false, error: errorType || 'UNKNOWN_ERROR' });
        }
      });

    } catch (err) {
      if (timeout) clearTimeout(timeout);
      // Clean up temporary file on failure
      try {
        if (tempPath && fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      } catch(e){}
      resolve({ success: false, error: err.message });
    }
  });
};

// Handle IPC requests to print dynamic receipt HTML silently in background
ipcMain.handle('print-receipt', async (event, { html, printerName, paperSize, printSettings }) => {
  // Chain printer commands to execute sequentially
  return new Promise((resolve) => {
    printQueue = printQueue
      .then(async () => {
        const result = await executePrintTask(html, printerName, paperSize, printSettings);
        resolve(result);
      })
      .catch((err) => {
        resolve({ success: false, error: err.message });
      });
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

