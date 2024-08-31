import React, { useState } from 'react';
import axios from 'axios';

function AudioGenerator({ setGeneratedFile }) {
  const [title, setTitle] = useState('');
  const [lang, setLang] = useState('en');
  const [size, setSize] = useState(0);
  const [forceRegenerate, setForceRegenerate] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/generate_audio', {
        title,
        lang,
        size: parseInt(size),
        force_regenerate: forceRegenerate
      });
      setGeneratedFile(response.data.filename);
    } catch (error) {
      console.error('Error generating audio:', error);
    }
  };

  return (
    <div>
      <h2>Generate Audio</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Wikipedia Title"
          required
        />
        <select value={lang} onChange={(e) => setLang(e.target.value)}>
          <option value="en">English</option>
          <option value="fr">French</option>
          <option value="es">Spanish</option>
        </select>
        <input
          type="number"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          placeholder="Size"
        />
        <label>
          <input
            type="checkbox"
            checked={forceRegenerate}
            onChange={(e) => setForceRegenerate(e.target.checked)}
          />
          Force Regenerate
        </label>
        <button type="submit">Generate Audio</button>
      </form>
    </div>
  );
}

export default AudioGenerator;
