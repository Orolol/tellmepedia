import React, { useState, useEffect } from 'react';
import AudioGenerator from './components/AudioGenerator';
import AudioList from './components/AudioList';
import AudioPlayer from './components/AudioPlayer';
import Navbar from './components/Navbar';
import History from './components/History';
import Favorites from './components/Favorites';
import './App.css';

function App() {
  const [generatedFile, setGeneratedFile] = useState(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Load saved preferences
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const savedHistory = JSON.parse(localStorage.getItem('history') || '[]');
    
    setDarkMode(savedDarkMode);
    setFavorites(savedFavorites);
    setHistory(savedHistory);
  }, []);

  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : '';
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const addToHistory = (item) => {
    const newHistory = [item, ...history.slice(0, 19)]; // Keep last 20 items
    setHistory(newHistory);
    localStorage.setItem('history', JSON.stringify(newHistory));
  };

  const toggleFavorite = (item) => {
    const isFavorite = favorites.some(fav => fav.filename === item.filename);
    let newFavorites;
    if (isFavorite) {
      newFavorites = favorites.filter(fav => fav.filename !== item.filename);
    } else {
      newFavorites = [...favorites, item];
    }
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  return (
    <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
      <Navbar 
        darkMode={darkMode} 
        setDarkMode={setDarkMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      
      <main className="container">
        {activeTab === 'generate' && (
          <section className="section main-section">
            <h2>Generate Audio</h2>
            <AudioGenerator 
              setGeneratedFile={setGeneratedFile} 
              onGenerate={addToHistory}
            />
            {generatedFile && (
              <p className="generated-file">Generated file: {generatedFile}</p>
            )}
          </section>
        )}

        {activeTab === 'history' && (
          <section className="section">
            <h2>History</h2>
            <History 
              history={history}
              setCurrentlyPlaying={setCurrentlyPlaying}
              toggleFavorite={toggleFavorite}
              favorites={favorites}
            />
          </section>
        )}

        {activeTab === 'favorites' && (
          <section className="section">
            <h2>Favorites</h2>
            <Favorites 
              favorites={favorites}
              setCurrentlyPlaying={setCurrentlyPlaying}
              toggleFavorite={toggleFavorite}
            />
          </section>
        )}

        {activeTab === 'library' && (
          <section className="section">
            <h2>Audio Library</h2>
            <AudioList 
              generatedFile={generatedFile} 
              setCurrentlyPlaying={setCurrentlyPlaying}
              toggleFavorite={toggleFavorite}
              favorites={favorites}
            />
          </section>
        )}

        <section className="section player-section">
          <h2>Now Playing</h2>
          <AudioPlayer 
            currentlyPlaying={currentlyPlaying}
            onShare={() => {/* Implement share functionality */}}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
