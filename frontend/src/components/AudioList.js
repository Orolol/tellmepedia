import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function AudioList({ generatedFile }) {
  const [audioFiles, setAudioFiles] = useState([]);
  const [filteredAudioFiles, setFilteredAudioFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAudioFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/list_audio_files');
      setAudioFiles(response.data);
    } catch (error) {
      console.error('Error fetching audio files:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAudioFiles();
    const intervalId = setInterval(fetchAudioFiles, 30000);
    return () => clearInterval(intervalId);
  }, [fetchAudioFiles]);

  useEffect(() => {
    if (generatedFile) {
      fetchAudioFiles();
    }
  }, [generatedFile, fetchAudioFiles]);

  useEffect(() => {
    filterAudioFiles();
  }, [audioFiles, searchQuery]);

  const filterAudioFiles = () => {
    const filtered = audioFiles.filter((file) =>
      file.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.lang.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredAudioFiles(filtered);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
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
      <div className="search-bar">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search audio files by title or language"
          className="search-input"
        />
      </div>
      {isLoading ? (
        <p className="loading">Loading audio files...</p>
      ) : (
        <ul className="audio-files">
          {filteredAudioFiles.map((file, index) => (
            <li key={index} className="audio-file-item">
              <div className="audio-file-info">
                <span className="audio-file-title">{file.title}</span>
                <span className="audio-file-lang">({file.lang})</span>
              </div>
              <button
                className="download-button"
                onClick={(e) => {
                  e.preventDefault();
                  handleDownload(file);
                }}
              >
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
