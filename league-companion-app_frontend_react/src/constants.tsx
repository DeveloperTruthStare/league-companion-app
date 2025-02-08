
export enum ConnectionStatus{
    STATE_NONE = 'NotInLobby',
    STATE_LOBBY = 'Lobby',
    STATE_MATCHMAKING = 'Matchmaking',
    STATE_READY_CHECK = 'ReadyCheck',
    STATE_CHAMP_SELECT = 'ChampSelect',
    STATE_GAME_START = 'GameStart',
    STATE_IN_PROGRESS = 'InProgress',
    STATE_WAITING_FOR_STATS = 'WaitingForStats',
    STATE_PRE_END_GAME = 'PreEndOfGame',
    STATE_END_GAME = 'EndOfGame'
}

export const PROXY_SERVER_BASE_URL = "http://127.0.0.1";