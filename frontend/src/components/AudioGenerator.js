import React, { useState } from 'react';
import axios from 'axios';

function AudioGenerator({ setGeneratedFile }) {
  const [title, setTitle] = useState('');
  const [lang, setLang] = useState('en');
  const [wikiUrl, setWikiUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
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
        lang: submissionLang
      });
      setGeneratedFile(response.data.filename);
    } catch (error) {
      console.error('Error generating audio:', error);
    } finally {
      setIsLoading(false);
      // Clean inputs after generation
      setTitle('');
      setWikiUrl('');
      setLang('en');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={wikiUrl}
          onChange={(e) => setWikiUrl(e.target.value)}
          placeholder="Wikipedia URL"
          disabled={isLoading}
        />
        <span className="or-separator">OR</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Wikipedia Title"
          required={!wikiUrl}
          disabled={isLoading}
        />
        <select 
          value={lang} 
          onChange={(e) => setLang(e.target.value)}
          disabled={isLoading}
        >
          <option value="en">English</option>
          <option value="fr">French</option>
          <option value="es">Spanish</option>
        </select>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate Audio'}
        </button>
      </form>
    </div>
  );
}

export default AudioGenerator;
