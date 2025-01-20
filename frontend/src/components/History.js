import React from 'react';
import { FaPlay, FaStar, FaRegStar, FaShare } from 'react-icons/fa';

function History({ history, setCurrentlyPlaying, toggleFavorite, favorites }) {
  const isInFavorites = (item) => {
    return favorites.some(fav => fav.filename === item.filename);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="history-container">
      {history.length === 0 ? (
        <p className="empty-message">No history yet. Generate some audio to get started!</p>
      ) : (
        <ul className="history-list">
          {history.map((item, index) => (
            <li key={index} className="history-item">
              <div className="item-info">
                <h3>{item.title}</h3>
                <span className="timestamp">{formatDate(item.timestamp)}</span>
                <span className="language">{item.lang.toUpperCase()}</span>
              </div>
              
              <div className="item-actions">
                <button
                  className="action-button"
                  onClick={() => setCurrentlyPlaying(item)}
                  title="Play"
                >
                  <FaPlay />
                </button>
                
                <button
                  className="action-button"
                  onClick={() => toggleFavorite(item)}
                  title={isInFavorites(item) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {isInFavorites(item) ? <FaStar className="favorite" /> : <FaRegStar />}
                </button>
                
                <button
                  className="action-button"
                  onClick={() => {
                    navigator.share({
                      title: item.title,
                      text: `Check out this audio version of "${item.title}" from TellMePedia!`,
                      url: window.location.href
                    }).catch(console.error);
                  }}
                  title="Share"
                >
                  <FaShare />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default History;