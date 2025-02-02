export const twitchLink = "https://twitch.tv/devilishtruthstare";
export const discordLink = "https://discord.gg/zPcYztZdX4";
export const strings = [
    "Streaming on Twitch—need the views to prove to my mom this is a real career. 🙃",
    "Live on Twitch! If I hit 10 viewers, I’ll finally clean my room!",
    "Streaming this game live—every viewer helps me recover from my crippling addiction to ramen!",
    "Twitch is up! I told my boss I was sick today, so help me make it worth it.!",
    "I’m live on Twitch—viewers get free, high-quality, totally useless life advice!",
    "Streaming right now on Twitch—my cat demands tribute, and he only accepts views.",
    "Live on Twitch—help me prove to my ex I’m doing great without them.",
    "Streaming this on Twitch—because therapy is expensive, and talking to chat is free.",
    "Catch our game live on Twitch! Don’t worry, I only flame quietly on stream. 🔥😏",
    "Streaming now—because my cat said they’d support me, but all they do is sleep.",
    "I’m live on Twitch—help me fulfill my dream of retiring at 30 to play League full-time!",
    "Streaming this game live on Twitch—join to see if I’m the hero or just the narrator of our downfall! 🎥😂",
    "Twitch is up, this game is live—come watch me make plays or make excuses in real time!",
    "Twitch stream is live—witness greatness… or a comedy show, depends on how we play.",
];

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