import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function AudioList({ generatedFile, setCurrentlyPlaying }) {
  const [ratingInput, setRatingInput] = useState('');
  const [audioFiles, setAudioFiles] = useState([]);
  const [filteredAudioFiles, setFilteredAudioFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [audio, setAudio] = useState(null);

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

  const handlePlay = async (file) => {
    if (audio && audio.src && audio.src.includes(encodeURIComponent(file.title))) {
      if (audio.paused) {
        audio.play();
        setCurrentlyPlaying(file.title);
      } else {
        audio.pause();
        setCurrentlyPlaying(null);
      }
      return;
    }

    if (audio) {
      audio.pause();
      URL.revokeObjectURL(audio.src);
    }

    try {
      const downloadUrl = `http://localhost:5000/download_audio?title=${encodeURIComponent(file.title)}&lang=${file.lang}`;
      const response = await axios.get(downloadUrl, {
        responseType: 'blob',
      });
      const audioBlob = new Blob([response.data], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const newAudio = new Audio(audioUrl);
      setAudio(newAudio);
      newAudio.play();
      setCurrentlyPlaying(file.title);
      newAudio.onended = () => {
        setCurrentlyPlaying(null);
        URL.revokeObjectURL(audioUrl);
      };
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const handleRatingChange = async (file, rating) => {
    try {
      const response = await axios.post(`http://localhost:5000/rate_audio?title=${encodeURIComponent(file.title)}&lang=${file.lang}`, {
        rating: rating,
      });
      const updatedFile = { ...file, rating: response.data.rating };
      setAudioFiles(audioFiles.map((f) => (f.title === file.title ? updatedFile : f)));
      setFilteredAudioFiles(filteredAudioFiles.map((f) => (f.title === file.title ? updatedFile : f)));
    } catch (error) {
      console.error('Error rating audio file:', error);
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
      <ul className="audio-files">
        {filteredAudioFiles.map((file, index) => (
          <li key={index} className="audio-file-item">
            <div className="audio-file-info">
              <span className="audio-file-title">{file.title}</span>
              <span className="audio-file-lang">({file.lang})</span>
            </div>
            <div className="audio-file-actions">
              <button
                className="play-button"
                onClick={() => handlePlay(file)}
              >
                {audio && audio.src && audio.src.includes(encodeURIComponent(file.title)) && !audio.paused ? 'Pause' : 'Play'}
              </button>
              <button
                className="download-button"
                onClick={(e) => {
                  e.preventDefault();
                  handleDownload(file);
                }}
              >
                Download
              </button>
            </div>
            <div className="rating-section">
              <input
                type="number"
                min="1"
                max="5"
                value={ratingInput}
                onChange={(e) => setRatingInput(e.target.value)}
              />
              <button onClick={() => handleRatingChange(file, ratingInput)}>Rate</button>
              <p>Current rating: {file.rating}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AudioList;
