"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    sendMessage: function (channel, data) { return electron_1.ipcRenderer.send(channel, data); },
    on: function (channel, callback) {
        electron_1.ipcRenderer.on(channel, function (_event, args) { return callback(args); });
    },
    removeListener: function (channel, callback) {
        electron_1.ipcRenderer.removeListener(channel, callback);
    },
    connectToLeagueClient: function () {
        electron_1.ipcRenderer.send('league-client', 'reconnect');
    },
    onVariableChange: function (callback) {
        electron_1.ipcRenderer.on('variable-updated', function (event, variable) {
            callback(variable);
        });
    },
    getVariable: function () { return electron_1.ipcRenderer.invoke('get-variable'); }
});
