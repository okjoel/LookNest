import React, { useState, useEffect, useRef } from 'react';
import './Dashboard.css';

function Dashboard() {
  const [stats] = useState({
    profileViews: 12543,
    photosUploaded: 247,
    followers: 1834,
    following: 892
  });

  const [viewsData] = useState([
    { month: 'Jan', views: 320 },
    { month: 'Feb', views: 450 },
    { month: 'Mar', views: 380 },
    { month: 'Apr', views: 520 },
    { month: 'May', views: 680 },
    { month: 'Jun', views: 890 },
    { month: 'Jul', views: 750 },
    { month: 'Aug', views: 920 },
    { month: 'Sep', views: 1100 },
    { month: 'Oct', views: 980 },
    { month: 'Nov', views: 1250 },
    { month: 'Dec', views: 1450 }
  ]);

  const maxViews = Math.max(...viewsData.map(d => d.views));

  // Dropdown state + ref
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

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
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Overview of your activity and engagement</p>
      </div>

      <div className="stats-grid">
        {/* Profile Views card with dropdown */}
        <div className="stat-card">
          <div className="stat-icon profile-views">
            <div className="profile-menu" ref={menuRef}>
              <div className="profile-icon" onClick={() => setMenuOpen(!menuOpen)}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 
                  11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 
                  17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 
                  5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 
                  3-1.34 3-3-1.34-3-3-3z"/>
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
          </div>
          <div className="stat-info">
            <h3>Profile Views</h3>
            <p className="stat-number">{stats.profileViews.toLocaleString()}</p>
            <span className="stat-change positive">+12.5% from last month</span>
          </div>
        </div>

        {/* Other stat cards unchanged */}
        <div className="stat-card">
          <div className="stat-icon photos-uploaded">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 
              0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 
              0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 
              12l4.5 6H5l3.5-4.5z"/>
            </svg>
          </div>
          <div className="stat-info">
            <h3>Photos Uploaded</h3>
            <p className="stat-number">{stats.photosUploaded.toLocaleString()}</p>
            <span className="stat-change positive">+8 this week</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon followers">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 11c1.66 0 2.99-1.34 
              2.99-3S17.66 5 16 5c-1.66 0-3 
              1.34-3 3s1.34 3 3 3zm-8 0c1.66 
              0 2.99-1.34 2.99-3S9.66 5 8 
              5C6.34 5 5 6.34 5 8s1.34 3 
              3 3zm0 2c-2.33 0-7 1.17-7 
              3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 
              0c-.29 0-.62.02-.97.05 1.16.84 
              1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
          </div>
          <div className="stat-info">
            <h3>Followers</h3>
            <p className="stat-number">{stats.followers.toLocaleString()}</p>
            <span className="stat-change positive">+45 new followers</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon following">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 
              4-4s-1.79-4-4-4-4 1.79-4 
              4 1.79 4 4 4zm0 2c-2.67 
              0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <div className="stat-info">
            <h3>Following</h3>
            <p className="stat-number">{stats.following.toLocaleString()}</p>
            <span className="stat-change">You're following</span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="chart-section">
        <div className="chart-header">
          <h2>Most Viewed Photos</h2>
          <p>Monthly photo views over the past year</p>
        </div>
        <div className="chart-container">
          <div className="chart">
            {viewsData.map((data, index) => (
              <div key={index} className="chart-bar-wrapper">
                <div 
                  className="chart-bar"
                  style={{ height: `${(data.views / maxViews) * 100}%` }}
                >
                  <div className="chart-tooltip">{data.views}</div>
                </div>
                <span className="chart-label">{data.month}</span>
              </div>
            ))}
          </div>
          <div className="chart-y-axis">
            <span>{maxViews}</span>
            <span>{Math.round(maxViews * 0.75)}</span>
            <span>{Math.round(maxViews * 0.5)}</span>
            <span>{Math.round(maxViews * 0.25)}</span>
            <span>0</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
