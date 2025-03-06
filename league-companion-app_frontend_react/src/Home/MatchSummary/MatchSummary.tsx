import { useState } from 'react';
import './MatchSummary.css';
import styles from '../../assets/styles.json'; 

interface Props {
    userPuuid: string;
    match: MatchDto;
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
    queueType: number;
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

type StylesDef = {
    [ key: string]: {tree: string, rune: string, keystone: string}
}

const stylesDef = styles as StylesDef;

const SummonerSpellReference: { [key: string]: string} = {
    '14': 'SummonerDot',
    '4': 'SummonerFlash',
    '11': 'SummonerSmite',
    '21': 'SummonerBarrier',
    '12': 'SummonerTeleport',
    '13': 'SummonerSnowball',
    '6': 'SummonerHaste',
    '32': 'SummonerBoost',
    '7': 'SummonerHeal'
};

const MatchSummary = ({ match, userPuuid }: Props) => {
    const [showVOD, setShowVOD] = useState(false);

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
        queueType: match.info.queueId,
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
    match.info.participants.forEach((player, _) => {
        if (player.puuid === userPuuid) {
            gameData.assists = player.assists;
            gameData.kills = player.kills;
            gameData.deaths = player.deaths;
            gameData.cs = player.totalMinionsKilled + player.wardsKilled;
            gameData.vision = player.visionScore;
            gameData.win = player.win;
            gameData.champion = player.championName;
            gameData.csmin = Math.round(gameData.cs * 600 / match.info.gameDuration) / 10;
            gameData.primaryRunePage = player.perks.styles[0].selections[0].perk;
            gameData.secondaryRunePage = player.perks.styles[1].selections[0].perk;
            gameData.item0 = player.item0;
            gameData.item1 = player.item1;
            gameData.item2 = player.item2;
            gameData.item3 = player.item3;
            gameData.item4 = player.item4;
            gameData.item5 = player.item5;
            gameData.item6 = player.item6;
            if (!SummonerSpellReference[player.summoner1Id]) {
                console.log(`Could not find Summoner Spell: ${player.summoner1Id}\nGameId: ${match.metadata.matchId}`)
            }
            if (!SummonerSpellReference[player.summoner2Id]) {
                console.log(`Could not find Summoner Spell: ${player.summoner2Id}'nGameId: ${match.metadata.matchId}`)
            }
            gameData.summonerSpell1 = SummonerSpellReference[String(player.summoner1Id)];
            gameData.summonerSpell2 = SummonerSpellReference[String(player.summoner2Id)]
            if (!stylesDef[player.perks.styles[1].selections[0].perk]) {
                console.log(`Could not find Style: ${player.perks.styles[1].selections[0].perk}\nChampion: ${player.championName}`)
            }
        }
    });

    const toggleVODView = () => {
        setShowVOD(prev => !prev);
    };

    const getQueueType = (queueType: number): string => {
        switch(queueType) {
            case 0:
                return "Custom";
            case 2:
            case 430:
                return "Blind Pick";
            case 4:
            case 420:
                return "Ranked Solo/Duo";
            case 6:
                return 'Ranked Flex';
            case 7:
            case 32:
            case 33:
                return "Cp-op vs AI";
            case 8:
            case 460:
                return "Twisted Treeline";
            case 9:
            case 470:
                return "Ranked Twisted Treeline";
            case 14:
            case 400:
                return "Draft Pick";
            case 25:
                return "Domion Co-op vs AI";
            case 31:
            case 830:
                return "Co-op vs AI Intro Bot";
            case 32:
            case 840:
                return "Co-op vs AI Beginner Bot";
            case 33:
            case 850:
                return "Co-op vs AI Intermediate Bot";
            case 41:
                return "Ranked Flex Twisted Treeline";
            case 42:
                return "5v5 Ranked Team";
            case 52:
            case 800:
                return "Co-op vs AI Twisted Treeline";
            case 61:
                return "595 Team Builder";
            case 65:
            case 450:
                return "ARAM";
            case 67:
                return "Co-op vs AI ARAM";
            case 70:
            case 1020:
                return "One for All";
            case 72:
                return "1v1 Snowdown Showdown";
            case 73:
                return "2v2 Snowdown Showdown";
            case 75:
                return "6v6 hexakill";
            case 76:
                return "URF";
            case 78:
                return "One For All: Mirror Mode";
            case 83:
                return "Co-op vs AI URF";
            case 91:
            case 92:
            case 93:
            case 950:
                return "Doom Bots Rank X";
            case 96:
            case 910:
                return "Ascension (Crystal Scar)";
            case 98:
                return "6v6 Hexakill Twisted Treeline";
            case 100:
                return "Butcher's Bridge 5v5 ARAM";
            case 300:
            case 920:
                return "ARAM: Legend of the Poro King";
            case 310:
                return "SR: Nemesis";
            case 313:
                return "SR: Black Market Brawlers";
            case 315:
            case 940:
                return "SR: Nexus Siege";
            case 317:
                return "Crystal Scar: Definitely Not Dominion";
            case 318:
            case 900:
                return "SR: ARURF";
            case 325:
                return "Random Game Mode";
            case 400:
                return "Normal";
            case 410:
                return "Dynamic Rank";
            case 440:
                return "Ranked Flex";
            case 450:
                return "ARAM";
            case 490:
                return "Quickplay";
            case 600:
                return "Blood Hunt Assassin";
            case 610:
                return "Dark Star: Singulatiry";
            case 700:
                return "SR: Clash";
            case 720:
                return "ARAM Clash";
            default:
                return String(queueType);
        }
    }

    return (
    <>
    <div className={`match ${gameData.win ? "winBackground" : "loseBackground"}`}>
        <div onClick={toggleVODView} className="matchHeader">
            <strong>{getQueueType(gameData.queueType)}</strong><span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
            {Math.round(match.info.gameDuration / 60)} Minutes
        </div>
        <div className="separator" />
        <div onClick={toggleVODView} className="matchBody">
            <div className="col1">
                <div className={`circleImageContainer ${gameData.win ? "winBorder" : "loseBorder"}`}>
                    <img src={`/champion/${gameData.champion}.png`} />
                </div>
            </div>
            <div className="perks">
                <img src={`/spell/${gameData.summonerSpell1}.png`} className="playerSummonerSpell1" />
                {stylesDef[gameData.primaryRunePage] && 
                <img src={`/perk-images/Styles/${stylesDef[gameData.primaryRunePage].tree}/${stylesDef[String(gameData.primaryRunePage)].rune}/${stylesDef[gameData.primaryRunePage].rune}.png`} className="playerRunePrimary" />}
                <img src={`/spell/${gameData.summonerSpell2}.png`} className="playerSummonerSpell2" />
                {stylesDef[gameData.secondaryRunePage] && 
                <img src={`/perk-images/Styles/${stylesDef[gameData.secondaryRunePage].keystone}.png`} className="playerRuneSecondary" />}
            </div>
            <div className="KDA">
                <div>{gameData.kills}/{gameData.deaths}/{gameData.assists}</div>
            </div>
            <div className="csvision">
                    <div>{gameData.cs} <span style={{color: 'lightgray'}} >({gameData.csmin}) CS</span></div>
                    <div>{gameData.vision} vision</div>
            </div>

            <div className="items">
                <img className={gameData.item0 === 0 ? "hidden" : ""} src={`/item/${gameData.item0}.png`} />
                <img className={gameData.item1 === 0 ? "hidden" : ""} src={`/item/${gameData.item1}.png`} />
                <img className={gameData.item2 === 0 ? "hidden" : ""} src={`/item/${gameData.item2}.png`} />
                <img className={gameData.item6 === 0 ? "hidden" : ""} src={`/item/${gameData.item6}.png`} />
                <img className={gameData.item3 === 0 ? "hidden" : ""} src={`/item/${gameData.item3}.png`} />
                <img className={gameData.item4 === 0 ? "hidden" : ""} src={`/item/${gameData.item4}.png`} />
                <img className={gameData.item5 === 0 ? "hidden" : ""} src={`/item/${gameData.item5}.png`} />
            </div>
            <div className="championNames">
                <div>
                    {match.info.participants.slice(0, 5).map((player, index) => (
                        <div key={index} className="riotIdGameName blueSide" >
                            {player.puuid === userPuuid && <strong>{player.championName}</strong>}
                            {player.puuid !== userPuuid && player.championName}
                            <img src={`/champion/${player.championName}.png`} width="20" height="20"/>
                        </div>
                    ))}
                </div>
                <div>
                    <img src="/resource/top" />
                    <img src="/resource/jungle" />
                    <img src="/resource/mid" />
                    <img src="/resource/bot" />
                    <img src="/resource/support" />
                </div>
                <div>
                    {match.info.participants.slice(5, 10).map((player, index) => (
                        <div key={index+5} className="riotIdGameName redSide" >
                            <img src={`/champion/${player.championName}.png`} width="20" height="20"/>
                            {player.puuid === userPuuid && <strong>{player.championName}</strong>}
                            {player.puuid !== userPuuid && player.championName}
                        </div>
                    ))}
                </div>
            </div>
        </div>
        <div className="extraStats">
            //TODO: Put More Stat icons here 
        </div>
        {showVOD && 
        <div className="vodDisplay">
            <video width="100%" height="auto" controls />
        </div>}
    </div>
    </>
  )
}

export default MatchSummary