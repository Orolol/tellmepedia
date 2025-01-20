import React from 'react';
import { FaPlay, FaStar, FaShare } from 'react-icons/fa';

function Favorites({ favorites, setCurrentlyPlaying, toggleFavorite }) {
  return (
    <div className="favorites-container">
      {favorites.length === 0 ? (
        <p className="empty-message">No favorites yet. Add some by clicking the star icon!</p>
      ) : (
        <ul className="favorites-list">
          {favorites.map((item, index) => (
            <li key={index} className="favorite-item">
              <div className="item-info">
                <h3>{item.title}</h3>
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
                  title="Remove from favorites"
                >
                  <FaStar className="favorite" />
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

export default Favorites;