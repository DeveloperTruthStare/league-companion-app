
export interface ElectronAPI {
    sendMessage: (channel: string, data: unknown) => void;
    on: (channel: string, callback: (data: unknown) => void) => void;
    removeListener: (channel: string, callback: (data: unknown) => void) => void;
    connectToLeagueClient: () => void;
    onVariableChange: (callback: (variable: unknown) => void) => void;
    getSummoner: () => Promise<Summoner>;
};

declare global {
    interface Window {
        electronAPI: ElectronAPI
    }
}
