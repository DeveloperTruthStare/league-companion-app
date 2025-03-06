import { app, BrowserWindow, clipboard, desktopCapturer, ipcMain, session } from 'electron';
import path from 'path';
import { LeagueConnector, ILeagueCallbacks, InfoState } from './leagueConnector';
import { strings, discordLink, twitchLink } from './constants';
import { initDB, insertUser, getUserByName, closeDB, getMatchHistory, insertMatchHistory } from './sqlite';

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

initDB().then(() => console.log("DB INIT"));

let mainWindow: BrowserWindow | null = null;
let leagueConnector: LeagueConnector = new LeagueConnector(myCallbackThing);
leagueConnector.onInfoStateChanged = (newState: InfoState, data: Summoner) => {
    console.log("Sending data to front end");
    mainWindow?.webContents.send('state-change', { newState: newState, summoner: data});
};

const insertMatch = async (matchId: string, puuid: string) => {    
    var matchData = await leagueConnector.getMatchData(matchId);
    insertMatchHistory(matchId, puuid, JSON.stringify(matchData), matchData.info.queueId, matchData.info.gameEndTimestamp);
}

leagueConnector.onUserFound = async (gameName: string, tagLine: string, puuid: string) => {
    var user = await getUserByName(gameName, tagLine);
    if (user === undefined) {
        console.log(`Registering ${gameName}#${tagLine} to the local database`);
        user = await insertUser(puuid, gameName, tagLine);
    }

    console.log(`User PUUID: ${user.puuid}`);

    const savedMatchHistory = await getMatchHistory(user.puuid);
    const COUNT = 100;
    var start = 0;
    if (savedMatchHistory.length === 0) {
        var newMatches: string[] = [];
        do {
            newMatches = await leagueConnector.getMatchHistory(puuid, start, COUNT);
            newMatches.map((match, _) => (
                insertMatch(match, puuid)
            ));
            start += COUNT;
        } while (newMatches.length === COUNT);

    } else {
        var foundMatch = false;
        let mostRecentMatch = savedMatchHistory[0];
        do {
            newMatches = await leagueConnector.getMatchHistory(puuid, start, COUNT);
            for(var i = 0; i < newMatches.length; ++i) {
                if (newMatches[i] == mostRecentMatch.metadata.matchId) {
                    foundMatch = true;
                    break;
                }
                
                insertMatch(newMatches[i], puuid);
            }
        } while (!foundMatch);
    }
    // Now it is possible to give the match history to the front end.
    leagueConnector.setMatchHistory(await getMatchHistory(puuid));
};

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

ipcMain.on('league-client/reconnect', async (event, data) => {
    if (leagueConnector.connected) {
        // Send to window
        mainWindow?.webContents.send('connection-status', 'Connected');
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

ipcMain.handle('get-summoner', () => {
    return leagueConnector.summoner;
})

process.on("SIGINT", async () => {
    await closeDB();
    process.exit(0);
})

/*
onLaunch | onUserChange => {
    // Download everything about the user's profile and cache it locally
    currentRank
    matchHistory

    .then() => // save it to a database
}

state = NoInfo

SetState = NoExtraInfo

State |= RankInfo = RankInfo
State |= MatchHistory = Ready

State = NoExtraInfo
State |= MatchHistory = MatchHistory
State |= RankInfo = Ready

NoInfo = 0
NoExtraInfo = 0x1
RankInfo = 0x11
MatchHistory = 0x101
Ready = 0x111

// Start window with loading screen
SetState(NoInfo);

- Call ps for client api details

- Call client api for current summoner
SetState(NoExtraInfo);
- Check local db if summoner exists
-- if yes goto SECTION_A
-- if no pull summoner data from server
--- go to SECTION_A
*/