import { useState, useEffect } from 'react';
import Alert from './components/Alert/Alert';
import { ConnectionStatus, twitchLink, strings, discordLink } from './constants';
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
        if (newState == ConnectionStatus.STATE_CHAMP_SELECT) {
          // Copy pre game msg to clipboard
          const randomString = strings[Math.floor(Math.random() * strings.length)];
          const fullMessage = randomString + "\n" + twitchLink + "\n" + discordLink + "\nvc if yall want";
          navigator.clipboard.writeText(fullMessage).catch((err) => console.error("Failed to copy text:", err));
        } else {
          // Copy post game msg to clipboard
          const postGameMessage = "Don't have to use it on me, but don't forget to use your prime sub.\n" + twitchLink;
          navigator.clipboard.writeText(postGameMessage).catch((err) => console.error("Failed to copy post game message:", err));
        }
      }
    }

    window.electronAPI.on('lol-gameflow', handleGameflowChange);

    return () => {
      window.electronAPI.removeListener('lol-gameflow', handleGameflowChange);
    };
  }, [gameState]);

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