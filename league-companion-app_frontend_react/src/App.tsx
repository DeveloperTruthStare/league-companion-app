import Alert from './components/Alert/Alert';
import ElectronApp from './ElectronApp';
import './App.css';
function App() {
  if (window.electronAPI) {
    return <ElectronApp />
  } else {
    return (
      <>
        <Alert title="Electron not Detected" description='Likely running in a browser window'
          dismissable={false} onDismiss={() => {}} type="danger" />
      </>
    )
  }
}

export default App
