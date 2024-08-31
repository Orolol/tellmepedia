import React, { useState } from 'react';
import AudioGenerator from './components/AudioGenerator';
import AudioList from './components/AudioList';
import AudioDownloader from './components/AudioDownloader';
import './App.css';

function App() {
  const [generatedFile, setGeneratedFile] = useState(null);

  return (
    <div className="App">
      <h1>TellMePedia</h1>
      <AudioGenerator setGeneratedFile={setGeneratedFile} />
      {generatedFile && <p>Generated file: {generatedFile}</p>}
      <AudioList />
      <AudioDownloader />
    </div>
  );
}

export default App;
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
