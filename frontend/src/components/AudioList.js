import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AudioList() {
  const [audioFiles, setAudioFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAudioFiles = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/list_audio_files');
        setAudioFiles(response.data);
      } catch (error) {
        console.error('Error fetching audio files:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAudioFiles();
  }, []);

  return (
    <div className="audio-list">
      {isLoading ? (
        <p>Loading audio files...</p>
      ) : (
        <ul>
          {audioFiles.map((file, index) => (
            <li key={index}>{file.title} ({file.lang})</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AudioList;
