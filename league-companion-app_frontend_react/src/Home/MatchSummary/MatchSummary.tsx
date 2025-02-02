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
    puuid: string;
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
            {matchData.self.queueType}
        </div>
        <div className="ChampIcons">
            {matchData.self.champion}
            {matchData.self.summonerSpell1}
            {matchData.self.summonerSpell2}
            {matchData.self.primaryRunePage}
            {matchData.self.secondaryRunePage}
        </div>
        <div className="KDA">
            <p>{matchData.self.kills}/{matchData.self.deaths}/{matchData.self.assists}</p>
            <p>{matchData.self.cs}CS ({matchData.self.csmin})</p>
            <p>{matchData.self.vision} vision</p>
        </div>
        <div className="items">

        </div>
        <div className="championNames">
            <div className="blueSide">
                {matchData.info.participants.slice(0, 5).map((player, index) => (
                    <div>{player.championName}</div>
                ))}
            </div>
            <div className="redSide">
                {matchData.info.participants.slice(5, 10).map((player, index) => (
                    <div>{player.championName}</div>
                ))}
            </div>
        </div>
    </div>}
    </>
  )
}

export default MatchSummary