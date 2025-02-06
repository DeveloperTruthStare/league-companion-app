import { useEffect, useState } from 'react';
import './MatchSummary.css';

interface Props {
    userPuuid: string;
    matchId: string;
}

interface Match {
    info: MatchInfo;
    self: GameData;
}

type MatchInfo = {
    gameDuration: number;
    participants: Participant[];
    queueId: number;
    teams: Team[];
}

type Team = {
    teamId: number;
    win: boolean;
}

type Participant = {
    assists: number;
    championName: string;
    deaths: number;
    kills: number;
    riotIdGameName: string;
    puuid: string;
    summoner1Id: number;
    summoner2Id: number;
    teamId: number;
    totalMinionsKilled: number;
    visionScore: number;
    wardsKilled: number;
    win: boolean;
}

type GameData = {
    assists: number;
    kills: number;
    deaths: number;
    queueType: string;
    win: boolean;
    cs: number;
    csmin: number;
    vision: number;
    items: number[];
    champion: string;
    summonerSpell1: string;
    summonerSpell2: string;
    primaryRunePage: string;
    secondaryRunePage: string;
}

const SummonerSpellReference = {
    '14': 'Ignite',
    '4': 'Flash',
    '11': 'Smite',
    '21': 'Barrier',
    '12': 'Teleport'
};

const MatchSummary = ({ matchId, userPuuid }: Props) => {
    const [matchData, setMatchData] = useState<Match | null>(null);

    useEffect(() => {
        fetch(`http://127.0.0.1:8080/riot/lol/match/v5/matches/${matchId}`)
        .then((response) => response.json())
        .then(json => {
            let tempMatchData = json as Match;

            let gameData: GameData = {
                assists: -1,
                kills: -1,
                deaths: -1,
                queueType: tempMatchData.info.queueId == 420 ? 'Ranked Solo' : 'Unknown',
                win: false,
                cs: -1,
                csmin: -1,
                vision: -1,
                items: [],
                champion: '',
                summonerSpell1: '',
                summonerSpell2: '',
                primaryRunePage: '',
                secondaryRunePage: ''
            };
            tempMatchData.info.participants.forEach((player, _) => {
                if (player.puuid === userPuuid) {
                    gameData.assists = player.assists;
                    gameData.kills = player.kills;
                    gameData.deaths = player.deaths;
                    gameData.cs = player.totalMinionsKilled + player.wardsKilled;
                    gameData.vision = player.visionScore;
                    gameData.win = player.win;
                    gameData.champion = player.championName;
                    gameData.csmin = Math.round(gameData.cs * 600 / tempMatchData.info.gameDuration) / 10;
                    //gameData.summonerSpell1 = SummonerSpellReference[player.summoner1Id.toString()];
                    //gameData.summonerSpell2 = SummonerSpellReference[player.summoner2Id.toString()];
                    gameData.primaryRunePage = '';
                    gameData.secondaryRunePage = '';
                }
            });

            tempMatchData.self = gameData;
            setMatchData(tempMatchData);
        });
    }, []);

    return (
    <>
    {!matchData ? "Loading" : 
    <div className={"matchSummary " + (matchData.self.win ? "win" : "lose")}>
        <div className="InfoBox1">
            <div>
                {matchData.self.queueType}
            </div>
            <div>
                {matchData.self.win ? "WIN" : "LOSS"} {Math.round(matchData.info.gameDuration / 60)}:{matchData.info.gameDuration % 60}
            </div>
        </div>
        <div className="ChampIcons">
            <img src="" className="playerChampion" />
            <div className="perks">
                <img src="" className="playerSummonerSpell1" />
                <img src="" className="playerSummonerSpell2" />
                <img src="" className="playerRunePrimary" />
                <img src="" className="playerRuneSecondary" />
            </div>
        </div>
        <div className="KDA">
            <div>{matchData.self.kills}/{matchData.self.deaths}/{matchData.self.assists}</div>
            <div>{matchData.self.cs}CS ({matchData.self.csmin})</div>
            <div>{matchData.self.vision} vision</div>
        </div>
        <div className="items">
            <img src="" />
            <img src="" />
            <img src="" />
            <img src="" />
            <img src="" />
            <img src="" />
            <img src="" />
        </div>
        <div className="championNames">
            <div className="blueSide">
                {matchData.info.participants.slice(0, 5).map((player, index) => (
                    <>
                        <div className="riotIdGameName" ><img src="" width="10" height="10"/>
                            {player.puuid === userPuuid && <strong>{player.riotIdGameName}</strong>}
                            {player.puuid !== userPuuid && player.riotIdGameName}
                        </div>
                    </>
                ))}
            </div>
            <div className="redSide">
                {matchData.info.participants.slice(5, 10).map((player, index) => (
                    <>
                        <div className="riotIdGameName" ><img src="" width="10" height="10"/>
                            {player.puuid === userPuuid && <strong>{player.riotIdGameName}</strong>}
                            {player.puuid !== userPuuid && player.riotIdGameName}
                        </div>
                    </>
                ))}
            </div>
        </div>
    </div>}
    </>
  )
}

export default MatchSummary