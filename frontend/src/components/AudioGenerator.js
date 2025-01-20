import React, { useState } from 'react';
import axios from 'axios';
import { FaSearch, FaGlobe, FaSpinner } from 'react-icons/fa';

function AudioGenerator({ setGeneratedFile, onGenerate }) {
  const [title, setTitle] = useState('');
  const [lang, setLang] = useState('en');
  const [wikiUrl, setWikiUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const languages = {
    en: 'English',
    fr: 'French',
    es: 'Spanish',
    de: 'German',
    it: 'Italian',
    pt: 'Portuguese',
    nl: 'Dutch',
    pl: 'Polish',
    ru: 'Russian',
    ja: 'Japanese',
    zh: 'Chinese',
    ko: 'Korean',
    ar: 'Arabic',
    hi: 'Hindi'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      let submissionTitle = title;
      let submissionLang = lang;

      if (wikiUrl) {
        try {
          const urlParts = new URL(wikiUrl);
          if (!urlParts.hostname.includes('wikipedia.org')) {
            throw new Error('Not a valid Wikipedia URL');
          }
          submissionLang = urlParts.hostname.split('.')[0];
          submissionTitle = decodeURIComponent(urlParts.pathname.split('/').pop().replace(/_/g, ' '));
        } catch (urlError) {
          throw new Error('Please enter a valid Wikipedia URL');
        }
      }

      const response = await axios.post('http://localhost:5000/generate_audio', {
        title: submissionTitle,
        lang: submissionLang
      });

      const generatedItem = {
        filename: response.data.filename,
        title: submissionTitle,
        lang: submissionLang,
        timestamp: new Date().toISOString()
      };

      setGeneratedFile(generatedItem);
      onGenerate?.(generatedItem);

      // Clean inputs after successful generation
      setTitle('');
      setWikiUrl('');
      setLang('en');
    } catch (error) {
      console.error('Error generating audio:', error);
      setError(error.response?.data?.message || error.message || 'Failed to generate audio');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="generator-container">
      <form onSubmit={handleSubmit} className="generator-form">
        <div className="input-group">
          <div className="input-wrapper">
            <FaGlobe className="input-icon" />
            <input
              type="text"
              value={wikiUrl}
              onChange={(e) => setWikiUrl(e.target.value)}
              placeholder="Paste Wikipedia URL"
              disabled={isLoading}
              className="url-input"
            />
          </div>
        </div>

        <div className="separator">
          <span className="or-text">OR</span>
        </div>

        <div className="input-group">
          <div className="input-wrapper">
            <FaSearch className="input-icon" />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter Wikipedia Article Title"
              required={!wikiUrl}
              disabled={isLoading}
              className="title-input"
            />
          </div>

          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value)}
            disabled={isLoading || wikiUrl}
            className="language-select"
          >
            {Object.entries(languages).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <button 
          type="submit" 
          disabled={isLoading || (!title && !wikiUrl)}
          className="generate-button"
        >
          {isLoading ? (
            <>
              <FaSpinner className="spinner" />
              Generating...
            </>
          ) : (
            'Generate Audio'
          )}
        </button>
      </form>
    </div>
  );
}

export default AudioGenerator;
