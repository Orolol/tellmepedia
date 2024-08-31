import React, { useState } from 'react';
import axios from 'axios';

function AudioDownloader() {
  const [title, setTitle] = useState('');
  const [lang, setLang] = useState('en');

  const handleDownload = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/download_audio?title=${title}&lang=${lang}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title}_${lang}.wav`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading audio:', error);
    }
  };

  return (
    <div>
      <h2>Download Audio</h2>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Audio Title"
        required
      />
      <select value={lang} onChange={(e) => setLang(e.target.value)}>
        <option value="en">English</option>
        <option value="fr">French</option>
        <option value="es">Spanish</option>
      </select>
      <button onClick={handleDownload}>Download</button>
    </div>
  );
}

export default AudioDownloader;
