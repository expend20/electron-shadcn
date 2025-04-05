import { contextBridge, ipcRenderer } from 'electron';
import exposeContexts from "./helpers/ipc/context-exposer";

// Expose all contexts from the existing setup
exposeContexts();

// Add debug utilities to help with the blank window issue
contextBridge.exposeInMainWorld('electronDebug', {
  showLogs: () => ipcRenderer.invoke('show-logs'),
  getAppInfo: () => ({
    versions: process.versions,
    platform: process.platform,
    arch: process.arch
  })
});
