import React from 'react';
import { FaSun, FaMoon, FaHistory, FaStar, FaHome, FaBook } from 'react-icons/fa';

function Navbar({ darkMode, setDarkMode, activeTab, setActiveTab }) {
  return (
    <nav className={`navbar ${darkMode ? 'dark' : ''}`}>
      <div className="nav-brand">
        <h1>TellMePedia</h1>
      </div>
      
      <div className="nav-links">
        <button 
          className={`nav-link ${activeTab === 'generate' ? 'active' : ''}`}
          onClick={() => setActiveTab('generate')}
        >
          <FaHome /> Generate
        </button>
        
        <button 
          className={`nav-link ${activeTab === 'library' ? 'active' : ''}`}
          onClick={() => setActiveTab('library')}
        >
          <FaBook /> Library
        </button>
        
        <button 
          className={`nav-link ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          <FaStar /> Favorites
        </button>
        
        <button 
          className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <FaHistory /> History
        </button>
      </div>
      
      <button 
        className="theme-toggle"
        onClick={() => setDarkMode(!darkMode)}
        title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {darkMode ? <FaSun /> : <FaMoon />}
      </button>
    </nav>
  );
}

export default Navbar;