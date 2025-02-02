import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld('electronAPI', {
    sendMessage: (channel: string, data: unknown) => ipcRenderer.send(channel, data),
    on: (channel: string, callback: (data: unknown) => void) => {
        ipcRenderer.on(channel, (_event, args) => callback(args));
    },
    removeListener: (channel: string, callback: (data: unknown) => void) => {
        ipcRenderer.removeListener(channel, callback);
    },
    connectToLeagueClient: () => {
        ipcRenderer.send('league-client', 'reconnect');
    },
    onVariableChange: (callback: (variable: unknown) => void) => {
        ipcRenderer.on('variable-updated', (event, variable) => {
            callback(variable);
        })
    },
    getVariable: () => ipcRenderer.invoke('get-variable')
});