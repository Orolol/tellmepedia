import React, { useState } from 'react';
import AudioGenerator from './components/AudioGenerator';
import AudioList from './components/AudioList';
import './App.css';

function App() {
  const [generatedFile, setGeneratedFile] = useState(null);

  return (
    <div className="App">
      <header>
        <h1>TellMePedia</h1>
      </header>
      <main className="container">
        <section className="section">
          <h2>Generate Audio</h2>
          <AudioGenerator setGeneratedFile={setGeneratedFile} />
          {generatedFile && <p className="generated-file">Generated file: {generatedFile}</p>}
        </section>
        <section className="section">
          <h2>Audio List</h2>
          <AudioList />
        </section>
      </main>
    </div>
  );
}

export default App;
