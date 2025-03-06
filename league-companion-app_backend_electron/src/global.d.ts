declare global {
  export type Summoner = {
      gameName: string;
      tagLine: string;
      profileIconId: number;
      puuid: string;
      summonerLevel: number;
      rankData: RankData;
      matchHistory: MatchDto[];
  };

  export type RankData = {
    tier: string;
    rank: string;
    leaguePoints: number;
    wins: number;
    loses: number;
    queueType: string;
  };


  export type MatchDto = {
    metadata: MatchMetaData;
    info: MatchInfo;
  }

  export type MatchInfo = {
    gameEndTimestamp: number;
    gameDuration: number;
    participants: Participant[];
    queueId: number;
    teams: Team[];
  }

  export type MatchMetaData = {
    dataVersion: number;
    matchId: string;
    participants: string[];
  }
  export type Team = {
    teamId: number;
    win: boolean;
  }
  export type Participant = {
    assists: number;
    championName: string;
    deaths: number;
    item0: number;
    item1: number;
    item2: number;
    item3: number;
    item4: number;
    item5: number;
    item6: number;
    kills: number;
    riotIdGameName: string;
    puuid: string;
    perks: Perk;
    summoner1Id: number;
    summoner2Id: number;
    teamId: number;
    totalMinionsKilled: number;
    visionScore: number;
    wardsKilled: number;
    win: boolean;
  }
  
export type Perk = {
  styles: Style[];
}

export type Style = {
  description: string;
  selections: StyleSelection[];
}

export type StyleSelection = {
  perk: string;
  var1: string;
  var2: string;
  var3: string;
}


}

export {};