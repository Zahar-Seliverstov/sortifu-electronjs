const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    openExplorer: () => ipcRenderer.send('open-explorer'),
    runSort: (path) => ipcRenderer.send('run-sort', path),
    stopSort: () => ipcRenderer.send('stop-sort'),
    setLoadLevel: (level) => ipcRenderer.send('set-load-level', level),

    onSelectPath: (callback) => ipcRenderer.on('set-path', (event, message) => callback(message)),
    onPrintLog: (callback) => ipcRenderer.on('print-log', (event, message) => callback(message)),
});