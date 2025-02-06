import { useState, useEffect } from 'react';
import Alert from './components/Alert/Alert';
import Home from './Home/Home';

function ElectronApp() {
  const [gameState, setGameState] = useState('uninitialized');
  const [connected, setConnected] = useState(false);
  const [showAlert, setShowAlert] = useState(true);

  useEffect(() => {
    const handleGameflowChange = (newState: unknown) => {
      setConnected(true);
      if (newState != gameState[gameState.length-1]) {
        setGameState(newState as string);
      }
    }

    window.electronAPI.on('lol-gameflow', handleGameflowChange);

    return () => {
      window.electronAPI.removeListener('lol-gameflow', handleGameflowChange);
    };
  }, [gameState, connected]);

  useEffect(() => {
    const handleGeneralUpdate = (status: unknown) => {
      setConnected((status as string) === 'Connected');
    };

    window.electronAPI.on('custom-update', handleGeneralUpdate);

    return () => {
      window.electronAPI.removeListener('custom-update', handleGeneralUpdate);
    };
  }, []);

  window.electronAPI.onVariableChange((updatedVariable: unknown) => {
    console.log(updatedVariable);
  });

  return (
    <>
    {(showAlert || !connected) && 
      <Alert 
      title={connected ? "Connected" : "Not Connected"}
      description={"to the League Client!" + (connected ? "" : "Retrying in 5s")}
      onDismiss={() => {setShowAlert(false);}}
      dismissable={connected}
      type={connected ? "primary" : "danger"} />
    }
    <Home />
    </>
  );
}

export default ElectronApp