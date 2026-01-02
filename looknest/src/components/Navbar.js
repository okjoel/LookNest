import React from 'react';
import './Navbar.css';

function Navbar({ onProfileClick }) {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="logo">LN</div>
      </div>
      
      <div className="navbar-center">
        <div className="search-container">
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search for ideas..."
          />
          <button className="search-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="navbar-right">
        <div className="profile-menu" onClick={onProfileClick} style={{ cursor: 'pointer' }}>
          <div className="profile-avatar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
