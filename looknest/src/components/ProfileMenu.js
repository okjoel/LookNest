import React, { useState, useEffect, useRef } from 'react';
import './ProfileMenu.css';

function ProfileMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="profile-menu" ref={menuRef}>
      <div className="profile-icon" onClick={() => setMenuOpen(!menuOpen)}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 
          1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 
          1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </div>

      {menuOpen && (
        <div className="dropdown">
          <button>Profile</button>
          <button>Settings</button>
          <button>Logout</button>
        </div>
      )}
    </div>
  );
}

export default ProfileMenu;
