import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AudioDownloader() {
  const [selectedFile, setSelectedFile] = useState('');
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

  const handleDownload = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/download_audio/${selectedFile}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', selectedFile);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading audio:', error);
    }
  };

  return (
    <div>
      <select 
        value={selectedFile} 
        onChange={(e) => setSelectedFile(e.target.value)}
        style={{ marginBottom: '1rem', padding: '0.5rem', width: '100%' }}
      >
        <option value="">Select a file</option>
        {audioFiles.map((file, index) => (
          <option key={index} value={file.filename}>{file.title} ({file.lang})</option>
        ))}
      </select>
      <button onClick={handleDownload} disabled={!selectedFile}>
        Download
      </button>
    </div>
  );
}

export default AudioDownloader;
