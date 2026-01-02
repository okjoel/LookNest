import React, { useState } from 'react';
import './LandingPage.css';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';

function LandingPage({ onLogin, onSignupComplete }) {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const handleSignupSuccess = (userData) => {
    setShowSignup(false);
    onSignupComplete(userData);
  };

  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="landing-logo">
          <div className="logo-circle">LN</div>
          <span className="logo-text">LookNest</span>
        </div>
        <div className="landing-nav-buttons">
          <button className="btn-secondary" onClick={() => setShowLogin(true)}>
            Log in
          </button>
          <button className="btn-primary" onClick={() => setShowSignup(true)}>
            Sign up
          </button>
        </div>
      </nav>

      <main className="landing-hero">
        <h1 className="hero-title">Discover ideas that inspire your everyday life</h1>
        
        <div className="search-bar-hero">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input type="text" placeholder="Search for inspiration..." />
        </div>

        <div className="hero-images">
          <div className="image-column column-1">
            <div className="hero-card card-1">
              <svg viewBox="0 0 200 280" fill="none">
                <rect width="200" height="280" rx="16" fill="#e3f2fd"/>
                <circle cx="100" cy="80" r="40" fill="#90caf9"/>
                <rect x="40" y="140" width="120" height="8" rx="4" fill="#64b5f6"/>
                <rect x="40" y="160" width="100" height="8" rx="4" fill="#64b5f6"/>
              </svg>
            </div>
            <div className="hero-card card-2">
              <svg viewBox="0 0 200 320" fill="none">
                <rect width="200" height="320" rx="16" fill="#f3e5f5"/>
                <path d="M40 100 Q100 60, 160 100 T160 180" fill="#ce93d8"/>
                <circle cx="100" cy="200" r="30" fill="#ba68c8"/>
              </svg>
            </div>
          </div>

          <div className="image-column column-2">
            <div className="hero-card card-3">
              <svg viewBox="0 0 200 240" fill="none">
                <rect width="200" height="240" rx="16" fill="#fff3e0"/>
                <rect x="40" y="60" width="120" height="100" rx="8" fill="#ffb74d"/>
                <circle cx="100" cy="190" r="20" fill="#ff9800"/>
              </svg>
            </div>
            <div className="hero-card card-4">
              <svg viewBox="0 0 200 300" fill="none">
                <rect width="200" height="300" rx="16" fill="#e8f5e9"/>
                <path d="M20 120 L100 50 L180 120 L180 250 L20 250 Z" fill="#66bb6a"/>
                <rect x="80" y="180" width="40" height="70" fill="#43a047"/>
              </svg>
            </div>
          </div>

          <div className="image-column column-3">
            <div className="hero-card card-5">
              <svg viewBox="0 0 200 280" fill="none">
                <rect width="200" height="280" rx="16" fill="#fce4ec"/>
                <circle cx="100" cy="100" r="50" fill="#f06292"/>
                <path d="M50 180 Q100 160, 150 180" stroke="#ec407a" strokeWidth="8" fill="none"/>
              </svg>
            </div>
            <div className="hero-card card-6">
              <svg viewBox="0 0 200 260" fill="none">
                <rect width="200" height="260" rx="16" fill="#e0f2f1"/>
                <rect x="40" y="60" width="120" height="140" rx="8" fill="#4db6ac"/>
                <circle cx="100" cy="130" r="30" fill="#26a69a"/>
              </svg>
            </div>
          </div>

          <div className="image-column column-4">
            <div className="hero-card card-7">
              <svg viewBox="0 0 200 300" fill="none">
                <rect width="200" height="300" rx="16" fill="#fff9c4"/>
                <polygon points="100,60 140,140 60,140" fill="#ffd54f"/>
                <rect x="60" y="150" width="80" height="100" rx="8" fill="#fbc02d"/>
              </svg>
            </div>
            <div className="hero-card card-8">
              <svg viewBox="0 0 200 240" fill="none">
                <rect width="200" height="240" rx="16" fill="#e1bee7"/>
                <circle cx="100" cy="120" r="60" fill="#ab47bc"/>
                <path d="M50 180 L100 140 L150 180" stroke="#8e24aa" strokeWidth="8" fill="none"/>
              </svg>
            </div>
          </div>
        </div>
      </main>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={onLogin} onSwitchToSignup={() => { setShowLogin(false); setShowSignup(true); }} />}
      {showSignup && <SignupModal onClose={() => setShowSignup(false)} onSwitchToLogin={() => { setShowSignup(false); setShowLogin(true); }} onSignupSuccess={handleSignupSuccess} />}
    </div>
  );
}

export default LandingPage;
