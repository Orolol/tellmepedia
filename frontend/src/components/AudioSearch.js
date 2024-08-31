import React, { useState } from 'react';
import axios from 'axios';

function AudioSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/search_audio?query=${searchQuery}`);
      // You might want to pass this data to a parent component or use a state management solution
      console.log(response.data);
    } catch (error) {
      console.error('Error searching audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="audio-search">
      <div className="search-input">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search audio files"
        />
        <button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>
    </div>
  );
}

export default AudioSearch;
