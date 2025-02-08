import { app, BrowserWindow, clipboard, desktopCapturer, ipcMain, session } from 'electron';
import path from 'path';
import { LeagueConnector, ILeagueCallbacks } from './leagueConnector';
import { strings, discordLink, twitchLink } from './constants';

let myCallbackThing: ILeagueCallbacks = {
    makeCallback: (route: string, data: unknown) => {
        mainWindow?.webContents.send(route, data);
        if (route === 'lol-gameflow') {
            if (data as string === 'ChampSelect') {
                const randomString = strings[Math.floor(Math.random() * strings.length)];
                const fullMessage = randomString + "\n" + twitchLink + "\n" + discordLink + "\nvc if yall want";
                clipboard.writeText(fullMessage);
            } else {
                const postGameMessage = `Don't have to use it on me, but don't forget to use your prime sub on twitch ${twitchLink}`;
                clipboard.writeText(postGameMessage);
            }
        }
    }
};


let mainWindow: BrowserWindow | null = null;
let leagueConnector: LeagueConnector = new LeagueConnector(myCallbackThing);

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    mainWindow.loadURL('http://localhost:5173');

    mainWindow.webContents.once('did-finish-load', leagueConnector.connectToLeague);
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
    if (leagueConnector.connected) {
        // Send to window

    } else {
        leagueConnector.connectToLeague();
    }
});

ipcMain.on('toMain', (event, data) => {
    console.log("Received from React:", data);
    event.reply("fromMain", `Echo: ${data}`);
});

ipcMain.handle('get-sources', async () => {
    return await desktopCapturer.getSources({ types: ["window", "screen"]});
})

ipcMain.handle('get-variable', () => {
    return leagueConnector.summoner;
})