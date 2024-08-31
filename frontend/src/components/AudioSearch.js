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
import React, { useState } from 'react';
import axios from 'axios';

function AudioPlayer({ currentlyPlaying }) {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !currentlyPlaying) return;

    try {
      const response = await axios.post('http://localhost:5000/add_comment', {
        audioFile: currentlyPlaying,
        comment: comment
      });
      setComments([...comments, response.data]);
      setComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  return (
    <div className="audio-player">
      {currentlyPlaying ? (
        <>
          <p>Now playing: {currentlyPlaying}</p>
          <div className="comment-section">
            <h3>Comments</h3>
            <ul>
              {comments.map((c, index) => (
                <li key={index}>{c.text}</li>
              ))}
            </ul>
            <form onSubmit={handleCommentSubmit}>
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
              />
              <button type="submit">Submit</button>
            </form>
          </div>
        </>
      ) : (
        <p>Play an audio to start</p>
      )}
    </div>
  );
}

export default AudioPlayer;
import React from 'react';

function AudioPlayer({ currentlyPlaying }) {
  return (
    <div className="audio-player">
      {currentlyPlaying ? (
        <p>Now playing: {currentlyPlaying}</p>
      ) : (
        <p>Play an audio to start</p>
      )}
    </div>
  );
}

export default AudioPlayer;
import React from 'react';

function AudioPlayer({ currentlyPlaying }) {
  return (
    <div className="audio-player">
      {currentlyPlaying ? (
        <p>Now playing: {currentlyPlaying}</p>
      ) : (
        <p>Play an audio to start</p>
      )}
    </div>
  );
}

export default AudioPlayer;
import React from 'react';

function AudioPlayer({ currentlyPlaying }) {
  return (
    <div className="audio-player">
      {currentlyPlaying ? (
        <p>Now playing: {currentlyPlaying}</p>
      ) : (
        <p>Play an audio to start</p>
      )}
    </div>
  );
}

export default AudioPlayer;
