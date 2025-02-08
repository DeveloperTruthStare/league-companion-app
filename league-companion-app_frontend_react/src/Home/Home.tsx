import './Home.css';
import { useState, useEffect } from 'react';
import MatchSummary from './MatchSummary/MatchSummary';
import { PROXY_SERVER_BASE_URL } from '../constants';

type Summoner = {
  gameName: string;
  tagLine: string;
  profileIconId: number;
  summonerLevel: number;
  rankDivision: string;
  rankNumber: string;
  lp: string;
}

type RankData = {
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  loses: number;
  queueType: string;
}

const Home = () => {
  const [summoner, setSummoner] = useState<Summoner | null>(null);
  const [matchHistory, setMatchHistory] = useState<string[]>([]);
  const [userPuuid, setUserPuuid] = useState('');

  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState('');

  const [rankData, setRankData] = useState<RankData | null>(null);

  if (!summoner) {
    window.electronAPI.getVariable().then((updatedSummoner: unknown) => {
      setSummoner(updatedSummoner as Summoner);
    });
  }
  window.electronAPI.onVariableChange((updatedSummoner: unknown) => {
    setSummoner(updatedSummoner as Summoner)
  });


  useEffect(() => {
    if (!summoner) return;
    fetch(`${PROXY_SERVER_BASE_URL}/americas/riot/account/v1/accounts/by-riot-id/${summoner.gameName}/${summoner.tagLine}`)
    .then((response) => {
      if (!response.ok) {
        setHasError(true);
        setError(String(response.status));
      }

      return response.json();
    })
    .then((json) => {
      setUserPuuid(json['puuid']);
    })
    .catch((err) => console.error(err));
  }, [summoner]);

  useEffect(() => {
    if (!userPuuid) return;

      fetch(`${PROXY_SERVER_BASE_URL}/americas/lol/match/v5/matches/by-puuid/${userPuuid}/ids`)
      .then((response) => {
        if (!response.ok) {
          setHasError(true);
          setError(String(response.status));
        }
        return response.json();
      })
      .then((json) => {
        setMatchHistory(json as string[]);
      })
      .catch((err) => console.error(err));

      fetch(`${PROXY_SERVER_BASE_URL}/na1/lol/summoner/v4/summoners/by-puuid/${userPuuid}`)
      .then((response) => {
        if (!response.ok) {
          setHasError(true);
          setError(String(response.status));
        }
        return response.json();
      })
      .then((json) => {
        const summonerId = json['id'];

        fetch(`${PROXY_SERVER_BASE_URL}/na1/lol/league/v4/entries/by-summoner/${summonerId}`)
        .then((response) => {
          if (!response.ok) {
            setHasError(true);
            setError(String(response.status));
          }
          return response.json();
        })
        .then((json) => {
          console.log(json);
          setRankData(json[0] as RankData);
        })

      })

  }, [userPuuid]);

  return (
    <>
    {!summoner ? "loading" : <>
    <div className="home">
      <div className="profile">
        <div className="userNameArea infoContainer">
          <div className="profileIcon">
            <div className="circleImageContainer profileBorder">
              <img src={`/profileicon/${summoner.profileIconId}.png`} />
            </div>
          </div>
          <h4><strong>{summoner.gameName}</strong>#{summoner.tagLine}</h4>
        </div>

      <div className="rankArea infoContainer">
        <h5>Rank Solo/Duo</h5>
        <div className="separator" />
        <div className="rankDisplayArea">
          <img src={`/rank/${summoner.rankDivision}`} />
          <div className="rankInfo">
            {rankData != null && <>
            <h2>{rankData.tier} {rankData.rank}</h2>
            {rankData.leaguePoints} LP
            </>}
            {rankData == null && "Loading Ranked Data"}
          </div>
        </div>
      </div>

      </div>
      <div className="matchHistory">
        <h1><b>Match History</b></h1>
        <div className="separator" />
        {!hasError && matchHistory.map((item, index) => (
          <MatchSummary key={index} matchId={item} userPuuid={userPuuid} />
        ))}
        {hasError && <>
          <h1>Error retrieving Data</h1>
          <p>{error}</p>
          </>}
      </div>
    </div>
    </>
    }
    </>
  )
}

export default Home