import find from 'find-process';
import WebSocket from 'ws';
import { LOCAL_HOST_S, LOCAL_WEB_SOCKET, PROXY_SERVER_BASE_URL } from './constants';


export type GameflowSession = {
    phase: string
};

type Result<T, E> = 
    | { success: true, data: T }
    | { success: false, error: E };

export interface ILeagueCallbacks {
    makeCallback: (route: string, data: unknown) => void;
};

export const enum InfoState {
    NoInfo = 0x0,
    NoExtraInfo = 0x1,
    NoRankInfo = 0x11,
    NoMatchHistory = 0x101,
    Ready = 0x111,
    SummonerInfo = 0x1,
    RankData = 0x100,
    MatchHistory = 0x010
};

export class LeagueConnector {
    connected: boolean = false;
    connecting: boolean = false;
    port: number = -1;
    auth: string = '';
    summoner: Summoner | null = null;
    callback: ILeagueCallbacks;
    onUserFound: (gameName: string, tagLine: string, puuid: string) => void;
    onInfoStateChanged: (newState: InfoState, data: Summoner) => void;

    state: InfoState;

    constructor(callbackObject: ILeagueCallbacks) {
        this.callback = callbackObject;
        this.onUserFound = () => {};
        this.onInfoStateChanged = () => {};
        this.state = InfoState.NoInfo;
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
        const url = `${LOCAL_WEB_SOCKET}:${this.port}`;
        const headers = {
            Authorization: `Basic ${Buffer.from(`riot:${this.auth}`).toString('base64')}`,
            'User-Agent': 'LeagueClient (WebSocket)' 
        };
    
        const ws = new WebSocket(url, { headers, rejectUnauthorized: false});
    
        ws.on('open', () => {
            ws.send(JSON.stringify([5, "OnJsonApiEvent"]));
            this.callback.makeCallback("connection-status", "Connected");
    
            this.getCurrentSummoner();
            this.getLolGameflowSession();
        });
    
        ws.on('message', (data) => {
            if (data.toString().length === 0) return;
    
            try {
                const message = JSON.parse(data.toString());
                if (message[2]?.uri === '/lol-gameflow/v1/session') {
                    const phase = message[2]?.data?.phase;
                    this.callback.makeCallback("lol-gameflow", phase);
                } if (message[2]?.uri === '/lol-matchmaking/v1/search') {
                    //console.log(`MATCHMAKING: ${data.toString()}`)
                }else {
                    //console.log(`RECV MSG: ${message[2].uri}`);
                }
            } catch (error) {
                console.error('Error parsing message:', data.toString());
            }
        });
    
        ws.on('error', (error) => {
            this.callback.makeCallback("connection-status", "Disconnected")
            console.error('WebSocket error:', error);
        });
    }
    
    clientCall = async <T>(route: string,
                              callback: (data: T) => void): Promise<Response> => {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        const url = `${LOCAL_HOST_S}:${this.port}${route}`;
    
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
        console.log("Getting Current Summoner from Client");
        const route = '/lol-summoner/v1/current-summoner'
        const error = await this.clientCall<Summoner>(route, async (data: Summoner) => {
            this.summoner = data;
            // Call riot API proxy to get puudi
            const gameName = this.summoner.gameName;
            const tagLine = this.summoner.tagLine;
            this.callback.makeCallback('summoner', this.summoner);
            const puuid = await this.getPuuid(gameName, tagLine);
            this.summoner.puuid = puuid;

            this.state = InfoState.NoExtraInfo;
            this.onInfoStateChanged(this.state, this.summoner);
            this.onUserFound(gameName, tagLine, puuid);

            const rankData = await this.getRankInfo(puuid);
            this.summoner.rankData = rankData;
            this.state = this.state | InfoState.RankData;

            this.onInfoStateChanged(this.state, this.summoner);
        });
    
        if (!error.ok) {
            console.error(`Erorr calling ${route}`);
        }
    }
    
    getPuuid = async (gameName: string, tagLine: string): Promise<string> => {
        const route = `/americas/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`
        const response = await fetch(`${PROXY_SERVER_BASE_URL}${route}`);
        if (!response.ok) {
            console.error(`Error fetching: ${route}`);
            return '';
        }
        const json = await response.json();
        return json['puuid'];
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

    getRankInfo = async (puuid: string): Promise<RankData> => {
        const route1 = `/na1/lol/summoner/v4/summoners/by-puuid/${puuid}`;
        const response = await fetch(`${PROXY_SERVER_BASE_URL}${route1}`);
        if (!response.ok) {
            console.log(`Failed to Fetch ${route1}`);
        }
        const json = await response.json();
        const summonerId = json['id'];

        const route2 = `/na1/lol/league/v4/entries/by-summoner/${summonerId}`;
        const response2 = await fetch(`${PROXY_SERVER_BASE_URL}${route2}`);
        if (!response2.ok) {
            console.log(`Failed to Fetch ${route2}`);
        }
        const json2 = await response2.json();
        return json2[0] as RankData;
    }

    getMatchHistory = async (puuid: string, start: number, count: number): Promise<string[]> => {
        const route = `/americas/lol/match/v5/matches/by-puuid/${puuid}/ids`
        var response = await fetch(`${PROXY_SERVER_BASE_URL}${route}?start=${start}&count=${count}`)
        var json = await response.json();
        return json as string[];
    }

    getMatchData = async (matchId: string): Promise<MatchDto> => {
        const route = `/americas/lol/match/v5/matches/${matchId}`
        var response = await fetch(`${PROXY_SERVER_BASE_URL}${route}`)
        var json = await response.json();
        return json as MatchDto;
    }

    setMatchHistory = (matchHistory: MatchDto[]) => {
        if (this.summoner == null) return;
        this.summoner.matchHistory = matchHistory;

        this.state = this.state | InfoState.MatchHistory;
        this.onInfoStateChanged(this.state, this.summoner);
    }
};