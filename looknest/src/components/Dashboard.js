import React, { useState, useEffect } from 'react';
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
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [currentUser]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Overview of your activity and engagement</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <h3>Profile Views</h3>
            <p className="stat-number">{stats.profileViews.toLocaleString()}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>Photos Uploaded</h3>
            <p className="stat-number">{stats.photosUploaded.toLocaleString()}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>Followers</h3>
            <p className="stat-number">{stats.followers.toLocaleString()}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>Following</h3>
            <p className="stat-number">{stats.following.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {loading && <div style={{ margin: '1rem', color: 'gray' }}>Loading stats...</div>}
      {error && <div style={{ margin: '1rem', color: 'red' }}>Error: {error}</div>}

      <div className="saved-photos-section">
        <h2>Saved Photos</h2>
        {savedPhotos.length === 0 ? (
          <p style={{ color: 'gray' }}>No saved photos yet.</p>
        ) : (
          <div className="saved-photos-grid">
            {savedPhotos.map(photo => (
              <div key={photo._id} className="saved-photo-card">
                <img src={photo.imageUrl[0]} alt={photo.title} style={{ width: '100px', borderRadius: '8px' }} />
                <div>{photo.title}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
