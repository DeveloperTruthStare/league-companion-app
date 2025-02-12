declare global {
  export type Match = {
      matchId: number;
      timeEnded: number;
      data: string;
      playerPuuid: string;
  }

  export type Summoner = {
      gameName: string;
      tagLine: string;
      profileIconId: number;
      summonerLevel: number;
      rankData: RankData;
  };

  export type RankData = {
    tier: string;
    rank: string;
    leaguePoints: number;
    wins: number;
    loses: number;
    queueType: string;
  };
}

export {};