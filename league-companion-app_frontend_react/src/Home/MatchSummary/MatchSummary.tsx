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
    item0: number;
    item1: number;
    item2: number;
    item3: number;
    item4: number;
    item5: number;
    item6: number;
    kills: number;
    deaths: number;
    queueType: string;
    win: boolean;
    cs: number;
    csmin: number;
    vision: number;
    items: number[];
    champion: string;
    summonerSpell1: number;
    summonerSpell2: number;
    primaryRunePage: number;
    secondaryRunePage: number;
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
    const [showVOD, setShowVOD] = useState(false);

    useEffect(() => {
        fetch(`http://127.0.0.1:8080/riot/lol/match/v5/matches/${matchId}`)
        .then((response) => response.json())
        .then(json => {
            let tempMatchData = json as Match;

            let gameData: GameData = {
                assists: -1,
                deaths: -1,
                item0: -1,
                item1: -1,
                item2: -1,
                item3: -1,
                item4: -1,
                item5: -1,
                item6: -1,
                kills: -1,
                queueType: tempMatchData.info.queueId == 420 ? 'Ranked Solo' : 'Unknown',
                win: false,
                cs: -1,
                csmin: -1,
                vision: -1,
                items: [],
                champion: '',
                summonerSpell1: -1,
                summonerSpell2: -1,
                primaryRunePage: -1,
                secondaryRunePage: -1
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
                    gameData.summonerSpell1 = player.summoner1Id
                    //gameData.summonerSpell2 = SummonerSpellReference[player.summoner2Id.toString()];
                    gameData.primaryRunePage = -1;
                    gameData.secondaryRunePage = -1;
                    gameData.item0 = player.item0;
                    gameData.item1 = player.item1;
                    gameData.item2 = player.item2;
                    gameData.item3 = player.item3;
                    gameData.item4 = player.item4;
                    gameData.item5 = player.item5;
                    gameData.item6 = player.item6;
                }
            });

            tempMatchData.self = gameData;
            setMatchData(tempMatchData);
        });
    }, []);

/*
8000 - percision
8200 - Domination


*/

    const toggleVODView = () => {
        setShowVOD(prev => !prev);
    };

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
            <img src={`http://127.0.0.1:8080/static/champion/${matchData.self.champion}`} className="playerChampion" />
            <div className="perks">
                <img src={`http://127.0.0.1:8080/static/spell/${matchData.self.summonerSpell1}`} className="playerSummonerSpell1" />
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
            <img src={`http://127.0.0.1:8080/static/item/${matchData.self.item0}`} />
            <img src={`http://127.0.0.1:8080/static/item/${matchData.self.item1}`} />
            <img src={`http://127.0.0.1:8080/static/item/${matchData.self.item2}`} />
            <img src={`http://127.0.0.1:8080/static/item/${matchData.self.item6}`} />
            <img src={`http://127.0.0.1:8080/static/item/${matchData.self.item3}`} />
            <img src={`http://127.0.0.1:8080/static/item/${matchData.self.item4}`} />
            <img src={`http://127.0.0.1:8080/static/item/${matchData.self.item5}`} />
        </div>
        <div className="championNames">
            <div className="blueSide">
                {matchData.info.participants.slice(0, 5).map((player, index) => (
                    <>
                        <div className="riotIdGameName" ><img src={`http://127.0.0.1:8080/static/champion/${player.championName}`} width="20" height="20"/>
                            {player.puuid === userPuuid && <strong>{player.championName}</strong>}
                            {player.puuid !== userPuuid && player.championName}
                        </div>
                    </>
                ))}
            </div>
            <div className="redSide">
                {matchData.info.participants.slice(5, 10).map((player, index) => (
                    <>
                        <div className="riotIdGameName" ><img src={`http://127.0.0.1:8080/static/champion/${player.championName}`} width="20" height="20"/>
                            {player.puuid === userPuuid && <strong>{player.championName}</strong>}
                            {player.puuid !== userPuuid && player.championName}
                        </div>
                    </>
                ))}
            </div>
        </div>
        <div className="vodButton">
            <button onClick={toggleVODView}>
                <i className="arrow down"></i>
            </button>
        </div>
    </div>}
    {showVOD && 
    <div className="vodDisplay">
        <video width="100%" height="auto" controls />
    </div>}
    </>
  )
}

export default MatchSummary