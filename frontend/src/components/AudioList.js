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
      <h2>Available Audio Files</h2>
      <ul>
        {audioFiles.map((file, index) => (
          <li key={index}>{file.title} ({file.lang})</li>
        ))}
      </ul>
    </div>
  );
}

export default AudioList;
