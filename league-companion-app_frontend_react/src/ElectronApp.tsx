import { useState, useEffect } from 'react';
import Alert from './components/Alert/Alert';
import Home from './Home/Home';

function ElectronApp() {
  const [connected, setConnected] = useState(false);
  const [showAlert, setShowAlert] = useState(true);

  // Handle callback for connection-status
  useEffect(() => {
    if (!connected) {
      window.electronAPI.sendMessage('league-client/reconnect', null);
    }

    const handleGeneralUpdate = (status: unknown) => {
      console.log("Got new Connection status");
      setConnected((status as string) === 'Connected');
    };

    window.electronAPI.on('connection-status', handleGeneralUpdate);

    return () => {
      window.electronAPI.removeListener('connection-status', handleGeneralUpdate);
    };
  }, [connected]);

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