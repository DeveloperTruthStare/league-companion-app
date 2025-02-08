import find from 'find-process';
import WebSocket from 'ws';

export type Summoner = {
    gameName: string;
    tag: string;
    profileIconId: number;
    summonerLevel: number;
}

export type GameflowSession = {
    phase: string
}

type Result<T, E> = 
    | { success: true, data: T }
    | { success: false, error: E };

export interface ILeagueCallbacks {
    makeCallback: (route: string, data: unknown) => void;
}

export class LeagueConnector {
    connected: boolean = false;
    connecting: boolean = false;
    port: number = -1;
    auth: string = '';
    summoner: Summoner | null = null;
    callback: ILeagueCallbacks;

    constructor(callbackObject: ILeagueCallbacks) {
        this.callback = callbackObject;
    }

    connectToLeague = async () => {
        if (this.connecting) return;

        while(!this.connected) {
            this.connecting = true;
            const result = await this.getLeagueClientDetails();
            if (result.success) {
                this.connected = true;
                this.port = result.data[0];
                this.auth = result.data[1];
                this.startWebSocket();
            } else {
                this.connected = false;
                console.log('Could not find client details');
                await new Promise(f => setTimeout(f, 5000));
            }
        }
    }

    getLeagueClientDetails = async (): Promise<Result<[number, string], string>> => {
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
    
    startWebSocket = () => {
        const url = `wss://127.0.0.1:${this.port}`;
        const headers = {
            Authorization: `Basic ${Buffer.from(`riot:${this.auth}`).toString('base64')}`,
            'User-Agent': 'LeagueClient (WebSocket)' 
        };
    
        const ws = new WebSocket(url, { headers, rejectUnauthorized: false});
    
        ws.on('open', () => {
            ws.send(JSON.stringify([5, "OnJsonApiEvent"]));
            this.callback.makeCallback("custom-update", "Connected");
    
            this.getLolGameflowSession();
            this.getCurrentSummoner();
        });
    
        ws.on('message', (data) => {
            if (data.toString().length === 0) return;
    
            try {
                const message = JSON.parse(data.toString());
                if (message[2]?.uri === '/lol-gameflow/v1/session') {
                    const phase = message[2]?.data?.phase;
                    this.callback.makeCallback("lol-gameflow", phase);
                }
            } catch (error) {
                console.error('Error parsing message:', data.toString());
                // wait 6s then start trying to reconnect
                setTimeout(() => {
                    this.connected = false;
                    this.connecting = false;
                    this.connectToLeague();
                }, 6000);
            }
        });
    
        ws.on('error', (error) => {
            this.callback.makeCallback("custom-update", "Disconnected")
            console.error('WebSocket error:', error);
        });
    }
    
    clientCall = async <T>(route: string,
                              callback: (data: T) => void): Promise<Response> => {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        const url = `https://127.0.0.1:${this.port}${route}`;
    
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Basic ${Buffer.from(`riot:${this.auth}`).toString('base64')}`,
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
    
    getCurrentSummoner = async (): Promise<void> => {
        const route = '/lol-summoner/v1/current-summoner'
        const error = await this.clientCall<Summoner>(route, async (data: Summoner) => {
            this.summoner = data;
            this.callback.makeCallback('variable-updated', this.summoner);
        });
    
        if (!error.ok) {
            console.error(`Erorr calling ${route}`);
        }
    }
    
    getLolGameflowSession = async (): Promise<void> => {
        const route = '/lol-gameflow/v1/session';
        const error = await this.clientCall<GameflowSession>(route, async (gameSession: GameflowSession) => {
            this.callback.makeCallback(route, gameSession.phase);
        });
    
        if (!error.ok) {
            if (error.status === 404) {
                this.callback.makeCallback(route, "NotInLobby");
            } else {
                console.error(`Erorr calling ${route}:`);
            }
        }
    }
};
    