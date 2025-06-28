const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  setAppPreference: (key, value) => ipcRenderer.invoke('set-app-preference', key, value),
  getAppPreferences: () => ipcRenderer.invoke('get-app-preferences'),
  restartApp: () => ipcRenderer.send('restart-app'),
  notifyReadyToShow: () => ipcRenderer.send('ready-to-show'),
  exportPreferencesFile: () => ipcRenderer.invoke('save-preferences-file'),
  importPreferencesFile: () => ipcRenderer.invoke('import-preferences-file'),
  deletePreferencesFile: () => ipcRenderer.invoke('delete-preferences-file'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version')
});