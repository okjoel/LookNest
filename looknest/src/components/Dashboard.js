import React, { useState, useEffect, useRef } from 'react';
import './Dashboard.css';

function Dashboard({ currentUser }) {
  const [stats, setStats] = useState({
    profileViews: 0,
    photosUploaded: 0,
    followers: 0,
    following: 0
  });
  const [savedPhotos, setSavedPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // NEW from his branch
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  // NEW chart data from his branch
  const [viewsData, setViewsData] = useState([]);
  const [maxViews, setMaxViews] = useState(0);

  useEffect(() => {
    if (!currentUser || !currentUser._id) return;

    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const userId = currentUser._id;

        // Fetch all stats in parallel
        const [viewsRes, photosRes, followersRes, followingRes, savedRes] = await Promise.all([
          fetch(`/api/users/${userId}/views`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
          fetch(`/api/photos/user/${userId}`),
          fetch(`/api/users/${userId}/followers`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
          fetch(`/api/users/${userId}/following`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
          fetch(`/api/users/${userId}/saved-photos`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
        ]);

        if (!viewsRes.ok || !photosRes.ok || !followersRes.ok || !followingRes.ok || !savedRes.ok) {
          throw new Error('Failed to fetch one or more stats');
        }

        const [views, photos, followers, following, savedPhotosData] = await Promise.all([
          viewsRes.json(),
          photosRes.json(),
          followersRes.json(),
          followingRes.json(),
          savedRes.json()
        ]);

        setStats({
          profileViews: Array.isArray(views) ? views.length : 0,
          photosUploaded: Array.isArray(photos) ? photos.length : 0,
          followers: Array.isArray(followers) ? followers.length : 0,
          following: Array.isArray(following) ? following.length : 0
        });

        setSavedPhotos(Array.isArray(savedPhotosData) ? savedPhotosData : []);

        // NEW: compute chart data
        if (Array.isArray(views)) {
          const monthly = Array.from({ length: 12 }, (_, index) => {
            const month = new Date();
            month.setMonth(month.getMonth() - (11 - index));
            const monthLabel = month.toLocaleString('default', { month: 'short' });

            const monthViews = views.filter(v => {
              const date = new Date(v.viewedAt);
              return date.getMonth() === month.getMonth() && date.getFullYear() === month.getFullYear();
            }).length;

            return { month: monthLabel, views: monthViews };
          });

          setViewsData(monthly);
          setMaxViews(Math.max(...monthly.map(m => m.views), 1));
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [currentUser]);

  // Dropdown outside click handler
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
          </div>
        </div>
      </div>

      {loading && <div style={{ margin: '1rem', color: 'gray' }}>Loading stats...</div>}
      {error && <div style={{ margin: '1rem', color: 'red' }}>Error: {error}</div>}

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
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
