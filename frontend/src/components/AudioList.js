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
    console.log('Download clicked for file:', file);
    if (!file) {
      console.error('Invalid file object');
      return;
    }
    if (!file.title || !file.lang) {
      console.error('Invalid file properties:', file);
      return;
    }
    try {
      const downloadUrl = `http://localhost:5000/download_audio?title=${encodeURIComponent(file.title)}&lang=${file.lang}`;
      console.log('Attempting to download:', downloadUrl);
      const response = await axios.get(downloadUrl, {
        responseType: 'blob',
      });
      console.log('Download response received:', response);
      const contentDisposition = response.headers['content-disposition'];
      let filename = file.title + '.wav';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      console.log('Download process completed');
    } catch (error) {
      console.error('Error downloading audio:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
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
              <button onClick={(e) => {
                e.preventDefault();
                handleDownload(file);
              }}>
                Download
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AudioList;
