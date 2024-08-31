import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AudioList() {
  const [audioFiles, setAudioFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAudioFiles();
  }, []);

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

  const handleDownload = async (file) => {
    if (!file || !file.filename) {
      console.error('Invalid file or filename');
      return;
    }
    try {
      const response = await axios.get(`http://localhost:5000/download_audio/${file.filename}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading audio:', error);
    }
  };

  return (
    <div className="audio-list">
      {isLoading ? (
        <p>Loading audio files...</p>
      ) : (
        <ul>
          {audioFiles.map((file, index) => (
            <li key={index}>
              {file.title} ({file.lang})
              <button onClick={() => handleDownload(file)}>Download</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AudioList;
