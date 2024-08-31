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
