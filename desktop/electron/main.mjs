import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import { loadDesktopCli } from '../../cli/lib/desktop-cli.mjs';
import { DESKTOP_IPC_CHANNELS } from '../../cli/lib/desktop-ipc-channels.mjs';
import { registerDesktopHandlers } from '../../cli/lib/desktop-handlers.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @returns {string} */
function getCliLibRoot() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'cli-lib');
  }
  return path.join(__dirname, '../../cli/lib');
}

let projectRoot = '';
let mainWindow = null;

/** @type {Awaited<ReturnType<typeof loadDesktopCli>>} */
let cli;

function createElectronDeps() {
  return {
    pickDirectory: async (defaultPath) => {
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
        defaultPath: defaultPath || projectRoot || os.homedir()
      });
      if (result.canceled || !result.filePaths[0]) return null;
      return result.filePaths[0];
    },
    revealPath: async (resolved) => {
      const err = await shell.openPath(resolved);
      if (err) throw new Error(err);
      return { ok: true };
    },
    openExternal: async (url) => {
      await shell.openExternal(url);
    },
    getProjectRoot: () => projectRoot,
    setProjectRoot: (root) => {
      projectRoot = root;
    }
  };
}

function registerIpc() {
  const cliLibRoot = getCliLibRoot();
  const { handlers, getSavedProjectRoot } = registerDesktopHandlers(cli, cliLibRoot, createElectronDeps());
  projectRoot = getSavedProjectRoot();

  for (const channel of DESKTOP_IPC_CHANNELS) {
    ipcMain.handle(channel, (_event, ...args) => handlers[channel](...args));
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(async () => {
  cli = await loadDesktopCli(getCliLibRoot());
  registerIpc();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
