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
      <div className="container">
        <div className="section">
          <h2>Generate Audio</h2>
          <AudioGenerator setGeneratedFile={setGeneratedFile} />
          {generatedFile && <p>Generated file: {generatedFile}</p>}
        </div>
        <div className="section">
          <h2>Audio List</h2>
          <AudioList />
        </div>
        <div className="section">
          <h2>Download Audio</h2>
          <AudioDownloader />
        </div>
      </div>
    </div>
  );
}

export default App;
