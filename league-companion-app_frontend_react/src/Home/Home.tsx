import './Home.css';
import { useState } from 'react';

interface Props {
    clientState: string
}

const Home = ({ clientState }: Props) => {
  const [variable, setVariable] = useState<unknown>(null);

  window.electronAPI.onVariableChange((updatedVariable: unknown) => {
    console.log(updatedVariable);
  });

  window.electronAPI.getVariable().then((variable) => {
    setVariable(variable);
  });

  return (
    <>
    {variable != null &&
    <>
      <p><strong>{variable.gameName}</strong>#{variable.tagLine}</p>

        <div className="mainContainer">
          <div className="rankedStatsColumn">
            <p>SoloQ Rank</p>
            <p>Flex Rank</p>
            <p>Champion Stats</p>
          </div>
          <div className="matchHistory">
          </div>
        </div>
        </>
    }
    </>
  )
}

export default Home