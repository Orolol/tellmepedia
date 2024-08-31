import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AudioList() {
  const [audioFiles, setAudioFiles] = useState([]);

  useEffect(() => {
    const fetchAudioFiles = async () => {
      try {
        const response = await axios.get('http://localhost:5000/list_audio_files');
        setAudioFiles(response.data);
      } catch (error) {
        console.error('Error fetching audio files:', error);
      }
    };

    fetchAudioFiles();
  }, []);

  return (
    <div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {audioFiles.map((file, index) => (
          <li key={index} style={{ marginBottom: '0.5rem' }}>{file.title} ({file.lang})</li>
        ))}
      </ul>
    </div>
  );
}

export default AudioList;
import React, { useState } from 'react';
import axios from 'axios';

function AudioSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [audioFiles, setAudioFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [audioPlayer, setAudioPlayer] = useState(null);

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/search_audio?query=${searchQuery}`);
      setAudioFiles(response.data);
    } catch (error) {
      console.error('Error searching audio:', error);
    }
  };

  const handlePlay = async (filename) => {
    try {
      const response = await axios.get(`http://localhost:5000/play_audio/${filename}`, {
        responseType: 'blob',
      });

      // Create a new audio player and set the source
      const audioPlayer = new Audio(URL.createObjectURL(response.data));
      setAudioPlayer(audioPlayer);
      setSelectedFile(filename);
      audioPlayer.play();
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search audio files"
      />
      <button onClick={handleSearch}>Search</button>

      <h3>Search Results</h3>
      <ul>
        {audioFiles.map((file, index) => (
          <li key={index}>
            <button onClick={() => handlePlay(file.filename)}>
              {file.title} ({file.lang}) {selectedFile === file.filename && '(Playing)'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AudioSearch;
