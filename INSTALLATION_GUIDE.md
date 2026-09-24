# AR Shinwari Hujra POS - Installation and Deployment Guide

This guide details how to build, package, and deploy the AR Shinwari Hujra POS application onto any Windows computer or laptop. 

The application is built with a lightweight, secure, and self-contained architecture. It is 100% free from malware, background services, registry modifications, or resource-heavy processes, ensuring maximum performance without slowing down target systems.

---

## 1. How the App Runs Safely on Any Computer

* **No Background Bloat:** Unlike heavy enterprise software, this app does not install background services or startup daemons that slow down your computer. It only consumes resources when it is open.
* **Dual Database Fallback:**
  * **Primary (SQLite):** Fast, local, serverless database file (ar_shinwari.db). No database server (like MySQL or SQL Server) is needed.
  * **Fallback (JSON):** If SQLite native bindings fail to load on a target computer, the app automatically switches to a robust JSON-based flat file database fallback (ar_shinwari_db.json). This ensures the app runs perfectly on any system without missing functionalities.
* **Sandbox Security:** Runs inside an Electron sandbox, preventing unauthorized system changes.

---

## 2. How to Generate the Standalone Installer (.exe)

You only need Node.js on the development computer used to package the app. Target computers do not need Node.js or git installed.

### Step 2.1: Install Dependencies (If not already installed)
Open PowerShell or Command Prompt in the project directory (AR_Shanwari) and run:
```powershell
npm.cmd install
npm.cmd install --prefix frontend
```

### Step 2.2: Compile and Package the Installer
Run the packaging script to bundle the frontend, backend, and database into a single, offline-ready Windows executable:
```powershell
npm.cmd run package
```

### Step 2.3: Retrieve the Installer
Once the build completes, open the new directory:
Folder: AR_Shanwari/dist-electron/

Inside, you will find:
* **AR Shinwari Hujra POS Setup.exe** (Standard Windows installer)
* **AR Shinwari Hujra POS.exe** (Portable executable - runs without installation)

### Step 2.4: Running in Development Mode (Optional)
If you want to run the app in development mode from PowerShell without packaging, use npm.cmd instead of npm to bypass script restriction errors:
```powershell
npm.cmd start
```

---

## 3. Deploying to Client Computers / Laptops

To install the POS on any client laptop or computer:

1. Copy **AR Shinwari Hujra POS Setup.exe** from your dist-electron/ directory onto a USB drive.
2. Plug the USB drive into the target computer.
3. Double-click **AR Shinwari Hujra POS Setup.exe**.
4. The installer will install the application, add a desktop shortcut, and launch the POS system.
5. **No Internet or extra software (like Node.js, database servers, etc.) is required on the client machine.**

---

## 4. Migrating / Backing Up Data

If you need to transfer products, categories, staff accounts, or sales history from one computer to another:

### Option A: Via the Admin UI (Recommended)
1. On the source computer, log in as Admin.
2. Go to Settings -> Backup and Restore.
3. Click Download Backup to save the backup file.
4. On the target computer, open the app, log in as Admin, go to Backup and Restore, and click Restore Database to upload the backup file.

### Option B: Manual Directory Copy
The application database files are stored in the user profile directory to prevent file lock and permission issues:
* **SQLite Database:** %APPDATA%/ar-shinwari-pos/ar_shinwari.db
* **JSON Fallback:** %APPDATA%/ar-shinwari-pos/ar_shinwari_db.json

Simply copy these database files to the same directory on the target computer to migrate the data.

---

## 5. Connecting a Thermal Receipt Printer

To enable receipt printing on target computers:
1. Connect your 80mm or 58mm thermal receipt printer (via USB or network).
2. Install the printer's driver on Windows and set it as the Default Printer.
3. In the POS app settings or during invoice generation, selecting Print Bill will automatically direct the receipt layout to the default Windows printer.
