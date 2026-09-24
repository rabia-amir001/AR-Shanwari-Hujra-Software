const { contextBridge, ipcRenderer, webFrame } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getPlatform: () => process.platform,
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  printReceipt: (html, printerName, paperSize, printSettings) => ipcRenderer.invoke('print-receipt', { html, printerName, paperSize, printSettings }),
  setZoomFactor: (factor) => webFrame.setZoomFactor(factor),
  getZoomFactor: () => webFrame.getZoomFactor()
});
