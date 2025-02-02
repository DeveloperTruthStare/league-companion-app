import { app, BrowserWindow, desktopCapturer, ipcMain, session } from 'electron';
import find from 'find-process';
import path from 'path';
import WebSocket from 'ws';

interface Client {
    connected: boolean;
    connecting: boolean;
    port: number;
    auth: string;
    summoner: Summoner | null;
}

interface GameflowSession {
    phase: string
}

interface Summoner {
    gameName: string;
    tag: string;
    puuid: string;
    profileIconId: number;
    accountId: number;
    summonerLevel: number;
    summonerId: number;
}

let mainWindow: BrowserWindow | null = null;

let client: Client = {
    connected: false,
    connecting: false,
    port: -1,
    auth: "",
    summoner: null
};

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    mainWindow.loadURL('http://localhost:5173');

    mainWindow.webContents.once('did-finish-load', connectToLeague);
}

async function connectToLeague() {
    if (client.connecting) return;

    while(!client.connected) {
        client.connecting = true;
        const result = await getLeagueClientDetails();
        if (result.success) {
            client.connected = true;
            client.port = result.data[0];
            client.auth = result.data[1];
            startWebSocket();
        } else {
            client.connected = false;
            console.log('Could not find client details');
            await new Promise(f => setTimeout(f, 5000));
        }
    }
}

app.whenReady().then(() => {
    createWindow();
    
    session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
        desktopCapturer.getSources({ types: ['window'] }).then((sources) => {
            var source = null;
            sources.forEach(element => {
                if (element.name === 'League of Legends (TM) Client') {
                    source = element;
                }
            });
            if (source) {
                callback({ video: source!, audio: 'loopback' });
            } else {
                console.error('Could not find League Game Window');
            }
        })
    }, { useSystemPicker: true });
    
    
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    })
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.on('league-client', async (event, data) => {
    if (client.connected) {
        // Send to window

    } else {
        connectToLeague();
    }
});

ipcMain.on('toMain', (event, data) => {
    console.log("Received from React:", data);
    event.reply("fromMain", `Echo: ${data}`);
});

ipcMain.handle('get-sources', async () => {
    return await desktopCapturer.getSources({ types: ["window", "screen"]});
})

type Result<T, E> = 
    | { success: true, data: T }
    | { success: false, error: E };

async function getLeagueClientDetails(): Promise<Result<[number, string], string>> {
    const processList = await find('name', 'LeagueClientUx.exe');
    if (!processList.length) {
        return { success: false, error: "Could not find League Process" };
    }
    const leagueCMD = processList[0].cmd;
    const authTokenMatch = leagueCMD.match(/--remoting-auth-token=([^\"]+)/);
    const authToken = authTokenMatch ? authTokenMatch[1] : "";
    const portMatch = leagueCMD.match(/--app-port=(\d+)/);
    const port = portMatch ? parseInt(portMatch[1]) : -1;

    return { success: true, data: [port, authToken] };
}

const startWebSocket = () => {
    const url = `wss://127.0.0.1:${client.port}`;
    const headers = {
        Authorization: `Basic ${Buffer.from(`riot:${client.auth}`).toString('base64')}`,
        'User-Agent': 'LeagueClient (WebSocket)' 
    };

    const ws = new WebSocket(url, { headers, rejectUnauthorized: false});

    ws.on('open', () => {
        ws.send(JSON.stringify([5, "OnJsonApiEvent"]));
        mainWindow?.webContents.send("custom-update", "Connected");

        getLolGameflowSession();
        getCurrentSummoner();
    });

    ws.on('message', (data) => {
        if (data.toString().length === 0) return;

        try {
            const message = JSON.parse(data.toString());
            if (message[2]?.uri === '/lol-gameflow/v1/session') {
                const phase = message[2]?.data?.phase;
                mainWindow?.webContents.send("lol-gameflow", phase);
            }
        } catch (error) {
            console.error('Error parsing message:', data.toString());
            // wait 6s then start trying to reconnect
            setTimeout(() => {
                client.connected = false;
                client.connecting = false;
                connectToLeague();
            }, 6000);
        }
    });

    ws.on('error', (error) => {
        mainWindow?.webContents.send("custom-update", "Disconnected")
        console.error('WebSocket error:', error);
    });
}

async function clientCall<T>(route: string,
                          callback: (data: T) => void): Promise<Response> {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    const url = `https://127.0.0.1:${client.port}${route}`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Authorization": `Basic ${Buffer.from(`riot:${client.auth}`).toString('base64')}`,
            "Accept": "application/json"
        }
    });

    if (!response.ok) {
        return response;
    }
    const data = await response.json() as T;
    callback(data);
    return response;
}

async function getCurrentSummoner(): Promise<void> {
    const route = '/lol-summoner/v1/current-summoner'
    const error = await clientCall<Summoner>(route, async (data: Summoner) => {
        client.summoner = data;
        mainWindow?.webContents.send('variable-updated', client.summoner);
    });

    if (!error.ok) {
        console.error(`Erorr calling ${route}`);
    }
}

async function getLolGameflowSession(): Promise<void> {
    const route = '/lol-gameflow/v1/session';
    const error = await clientCall<GameflowSession>(route, async (gameSession: GameflowSession) => {
        mainWindow?.webContents.send(route, gameSession.phase);
    });

    if (!error.ok) {
        if (error.status === 404) {
            mainWindow?.webContents.send(route, "NotInLobby");
        } else {
            console.error(`Erorr calling ${route}:`);
        }
    }
}

ipcMain.handle('get-variable', () => {
    return client.summoner;
})