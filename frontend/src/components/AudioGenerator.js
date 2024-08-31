import React, { useState } from 'react';
import axios from 'axios';

function AudioGenerator({ setGeneratedFile }) {
  const [title, setTitle] = useState('');
  const [lang, setLang] = useState('en');
  const [size, setSize] = useState(0);
  const [forceRegenerate, setForceRegenerate] = useState(false);
  const [wikiUrl, setWikiUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let submissionTitle = title;
      let submissionLang = lang;

      if (wikiUrl) {
        const urlParts = new URL(wikiUrl);
        submissionLang = urlParts.hostname.split('.')[0];
        submissionTitle = decodeURIComponent(urlParts.pathname.split('/').pop().replace(/_/g, ' '));
      }

      const response = await axios.post('http://localhost:5000/generate_audio', {
        title: submissionTitle,
        lang: submissionLang,
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
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={wikiUrl}
          onChange={(e) => setWikiUrl(e.target.value)}
          placeholder="Wikipedia URL (optional)"
        />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Wikipedia Title"
          required={!wikiUrl}
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
