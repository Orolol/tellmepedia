import React, { useState } from 'react';
import AudioGenerator from './components/AudioGenerator';
import AudioList from './components/AudioList';
import AudioDownloader from './components/AudioDownloader';
import AudioSearch from './components/AudioSearch';
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
          {generatedFile && <p>Generated file: {generatedFile}</p>}
        </section>
        <section className="section">
          <h2>Audio List</h2>
          <AudioList />
        </section>
        <section className="section">
          <h2>Download Audio</h2>
          <AudioDownloader />
        </section>
        <section className="section">
          <h2>Search and Play Audio</h2>
          <AudioSearch />
        </section>
      </main>
    </div>
  );
}

export default App;
.App {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.section {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #34495e;
  margin-bottom: 1rem;
}

input, select, button {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
}

button {
  background-color: #3498db;
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #2980b9;
}

button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin-bottom: 0.5rem;
}
