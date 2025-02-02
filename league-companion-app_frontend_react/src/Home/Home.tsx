import './Home.css';
import { useState, useEffect } from 'react';
import MatchSummary from './MatchSummary/MatchSummary';

type Summoner = {
  gameName: string;
  tagLine: string;
}

const Home = () => {
  const [variable, setVariable] = useState<Summoner | null>(null);
  const [matchHistory, setMatchHistory] = useState<string[]>([]);
  const [userPuuid, setUserPuuid] = useState('');

  if (!variable) {
    window.electronAPI.getVariable().then((variable: unknown) => {
      setVariable(variable as Summoner);
    });
  }
  window.electronAPI.onVariableChange((updatedVariable: unknown) => {
    setVariable(updatedVariable as Summoner)
  });


  useEffect(() => {
    if (!variable) return;
    fetch(`http://127.0.0.1:8080/riot/riot/account/v1/accounts/by-riot-id/${variable?.gameName}/${variable?.tagLine}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((json) => {
      setUserPuuid(json['puuid']);
    })
    .catch((err) => console.error(err));
  }, [variable]);

  useEffect(() => {
    if (!userPuuid) return;
      fetch(`http://127.0.0.1:8080/riot/lol/match/v5/matches/by-puuid/${userPuuid}/ids`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((json) => {
        console.log(json);
        setMatchHistory(json as string[]);
      })
      .catch((err) => console.error(err));
  }, [userPuuid]);

  return (
    <>
    {!variable ? "loading" : <>
    <div className="header">
      <h1><strong>{variable.gameName}</strong><span>#{variable.tagLine}</span></h1>
    </div>

        <div className="mainContainer">
          <div className="rankedStatsColumn">
            <p>SoloQ Rank</p>
            <p>Flex Rank</p>
            <p>Champion Stats</p>
          </div>
          <div className="matchHistory">
            {matchHistory.map((item, index) => (
              <MatchSummary matchId={item} userPuuid={userPuuid} />
            ))}
          </div>
        </div>
    </>
    }
    </>
  )
}

export default Home