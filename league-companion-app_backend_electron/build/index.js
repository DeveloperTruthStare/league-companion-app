"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var find_process_1 = __importDefault(require("find-process"));
var path_1 = __importDefault(require("path"));
var ws_1 = __importDefault(require("ws"));
var mainWindow = null;
var client = {
    connected: false,
    connecting: false,
    port: -1,
    auth: "",
    summoner: null
};
var createWindow = function () {
    mainWindow = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.once('did-finish-load', connectToLeague);
};
function connectToLeague() {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (client.connecting)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    if (!!client.connected) return [3 /*break*/, 6];
                    client.connecting = true;
                    return [4 /*yield*/, getLeagueClientDetails()];
                case 2:
                    result = _a.sent();
                    if (!result.success) return [3 /*break*/, 3];
                    client.connected = true;
                    client.port = result.data[0];
                    client.auth = result.data[1];
                    startWebSocket();
                    return [3 /*break*/, 5];
                case 3:
                    client.connected = false;
                    console.log('Could not find client details');
                    return [4 /*yield*/, new Promise(function (f) { return setTimeout(f, 5000); })];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [3 /*break*/, 1];
                case 6: return [2 /*return*/];
            }
        });
    });
}
electron_1.app.whenReady().then(function () {
    createWindow();
    electron_1.session.defaultSession.setDisplayMediaRequestHandler(function (request, callback) {
        electron_1.desktopCapturer.getSources({ types: ['window'] }).then(function (sources) {
            var source = null;
            sources.forEach(function (element) {
                if (element.name === 'League of Legends (TM) Client') {
                    source = element;
                }
            });
            if (source) {
                callback({ video: source, audio: 'loopback' });
            }
            else {
                console.error('Could not find League Game Window');
            }
        });
    }, { useSystemPicker: true });
    electron_1.app.on('activate', function () {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.ipcMain.on('league-client', function (event, data) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        if (client.connected) {
            // Send to window
        }
        else {
            connectToLeague();
        }
        return [2 /*return*/];
    });
}); });
electron_1.ipcMain.on('toMain', function (event, data) {
    console.log("Received from React:", data);
    event.reply("fromMain", "Echo: ".concat(data));
});
electron_1.ipcMain.handle('get-sources', function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, electron_1.desktopCapturer.getSources({ types: ["window", "screen"] })];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); });
function getLeagueClientDetails() {
    return __awaiter(this, void 0, void 0, function () {
        var processList, leagueCMD, authTokenMatch, authToken, portMatch, port;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, find_process_1.default)('name', 'LeagueClientUx.exe')];
                case 1:
                    processList = _a.sent();
                    if (!processList.length) {
                        return [2 /*return*/, { success: false, error: "Could not find League Process" }];
                    }
                    leagueCMD = processList[0].cmd;
                    authTokenMatch = leagueCMD.match(/--remoting-auth-token=([^\"]+)/);
                    authToken = authTokenMatch ? authTokenMatch[1] : "";
                    portMatch = leagueCMD.match(/--app-port=(\d+)/);
                    port = portMatch ? parseInt(portMatch[1]) : -1;
                    return [2 /*return*/, { success: true, data: [port, authToken] }];
            }
        });
    });
}
var startWebSocket = function () {
    var url = "wss://127.0.0.1:".concat(client.port);
    var headers = {
        Authorization: "Basic ".concat(Buffer.from("riot:".concat(client.auth)).toString('base64')),
        'User-Agent': 'LeagueClient (WebSocket)'
    };
    var ws = new ws_1.default(url, { headers: headers, rejectUnauthorized: false });
    ws.on('open', function () {
        ws.send(JSON.stringify([5, "OnJsonApiEvent"]));
        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send("custom-update", "Connected");
        getLolGameflowSession();
        getCurrentSummoner();
    });
    ws.on('message', function (data) {
        var _a, _b, _c;
        if (data.toString().length === 0)
            return;
        try {
            var message = JSON.parse(data.toString());
            if (((_a = message[2]) === null || _a === void 0 ? void 0 : _a.uri) === '/lol-gameflow/v1/session') {
                var phase = (_c = (_b = message[2]) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.phase;
                mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send("lol-gameflow", phase);
            }
        }
        catch (error) {
            console.error('Error parsing message:', data.toString());
            // wait 6s then start trying to reconnect
            setTimeout(function () {
                client.connected = false;
                client.connecting = false;
                connectToLeague();
            }, 6000);
        }
    });
    ws.on('error', function (error) {
        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send("custom-update", "Disconnected");
        console.error('WebSocket error:', error);
    });
};
function clientCall(route, callback) {
    return __awaiter(this, void 0, void 0, function () {
        var url, response, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                    url = "https://127.0.0.1:".concat(client.port).concat(route);
                    return [4 /*yield*/, fetch(url, {
                            method: "GET",
                            headers: {
                                "Authorization": "Basic ".concat(Buffer.from("riot:".concat(client.auth)).toString('base64')),
                                "Accept": "application/json"
                            }
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        return [2 /*return*/, response];
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    callback(data);
                    return [2 /*return*/, response];
            }
        });
    });
}
function getCurrentSummoner() {
    return __awaiter(this, void 0, void 0, function () {
        var route, error;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    route = '/lol-summoner/v1/current-summoner';
                    return [4 /*yield*/, clientCall(route, function (data) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                client.summoner = data;
                                mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send('variable-updated', client.summoner);
                                return [2 /*return*/];
                            });
                        }); })];
                case 1:
                    error = _a.sent();
                    if (!error.ok) {
                        console.error("Erorr calling ".concat(route));
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function getLolGameflowSession() {
    return __awaiter(this, void 0, void 0, function () {
        var route, error;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    route = '/lol-gameflow/v1/session';
                    return [4 /*yield*/, clientCall(route, function (gameSession) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send(route, gameSession.phase);
                                return [2 /*return*/];
                            });
                        }); })];
                case 1:
                    error = _a.sent();
                    if (!error.ok) {
                        if (error.status === 404) {
                            mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send(route, "NotInLobby");
                        }
                        else {
                            console.error("Erorr calling ".concat(route, ":"));
                        }
                    }
                    return [2 /*return*/];
            }
        });
    });
}
electron_1.ipcMain.handle('get-variable', function () {
    return client.summoner;
});
