declare global {
    type RankData = {
      tier: string;
      rank: string;
      leaguePoints: number;
      wins: number;
      loses: number;
      queueType: string;
    }

    type Summoner = {
        gameName: string;
        tagLine: string;
        profileIconId: number;
        summonerLevel: number;
    }
}

export {};