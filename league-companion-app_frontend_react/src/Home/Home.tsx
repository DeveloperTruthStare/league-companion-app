import './Home.css';
import { useState, useEffect } from 'react';
import MatchSummary from './MatchSummary/MatchSummary';
import { InfoState } from './State';

const Home = () => {
  const [summoner, setSummoner] = useState<Summoner | null>(null);
  const [state, setState] = useState(InfoState.NoInfo)

  useEffect(() => {
    const handleStateChanged = (data: unknown) => {
      let data2 = data as { newState: InfoState, summoner: Summoner};
      console.log(`Settings State to : ${data2.newState}`);
      setState(data2.newState);
      setSummoner(data2.summoner);
    };

    window.electronAPI.on('state-change', handleStateChanged);

    return window.electronAPI.removeListener('state-change', handleStateChanged);
  }, [state, summoner]);

  const ProfileSection = 
    <div className="userNameArea infoContainer">
      <div className="profileIcon">
        <div className="circleImageContainer profileBorder">
          {state === InfoState.NoInfo ? 
            <img src="" /> :
            <img src={`/profileicon/${summoner?.profileIconId}.png`} />
          }
        </div>
      </div>
      {state === InfoState.NoInfo ? 
      <h4><strong>Summoner</strong>#Not loaded</h4> :
      <h4><strong>{summoner?.gameName}</strong>#{summoner?.tagLine}</h4>
      }
    </div>;

  const MatchHistorySection = (state === InfoState.Ready || state === InfoState.NoRankInfo) ? 
  <>
      <div className="matchHistory">
        <h1><b>Match History</b></h1>
        <div className="separator" />
        {summoner?.matchHistory.map((item, index) => (
          <MatchSummary key={index} matchId={item} userPuuid={summoner.puuid} />
        ))}
      </div>
  </> : 
  <>
  <div>Loading Match History</div>
  </>; 
  const showRankInfo = (state === InfoState.NoMatchHistory || state === InfoState.Ready);
  const RankDataSection = 
    <div className="rankArea infoContainer">
      <h5>Rank Solo/Duo</h5>
      <div className="separator" />
      <div className="rankDisplayArea">
        <img src={`/rank/${summoner?.rankData?.tier}`} />
        <div className="rankInfo">
          {showRankInfo ? <>
            <h2>{summoner?.rankData.tier} {summoner?.rankData.rank}</h2>
            {summoner?.rankData.leaguePoints} LP
          </> : 
            "Loading Ranked Data"
          }
        </div>
      </div>
    </div>

  return (
    <div className="home">
      <div className="profile">
        {ProfileSection}
        {RankDataSection}
      </div>
      {MatchHistorySection}
    </div>
  )
}

export default Home