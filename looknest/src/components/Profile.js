import React, { useState, useEffect } from 'react';
import './Profile.css';
import { initSocket, addMessageListener, removeMessageListener } from '../socket';
import PhotoModal from './PhotoModal';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [userPhotos, setUserPhotos] = useState([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    initSocket();
    const handleMessage = (data) => {
      if (data.type === 'following_updated' || data.type === 'followers_updated') {
        fetchUserProfile();
      } else if (data.type === 'photo_uploaded' && user) {
        fetchUserPhotos(user._id);
      }
    };
    addMessageListener(handleMessage);
    return () => {
      removeMessageListener(handleMessage);
    };
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const userData = await response.json();
      if (response.ok) {
        setUser(userData);
        // Fetch user's photos after getting user data
        fetchUserPhotos(userData._id);
      } else {
        console.error('Failed to fetch profile:', userData.message);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPhotos = async (userId) => {
    try {
      setPhotosLoading(true);
      const response = await fetch(`http://localhost:5000/api/photos/user/${userId}`);
      const photos = await response.json();
      if (response.ok) {
        setUserPhotos(photos);
      } else {
        console.error('Failed to fetch photos:', photos.message);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setPhotosLoading(false);
    }
  };

  const handlePhotoClick = async (photo) => {
    try {
      // Fetch full photo details with comments and likes
      const response = await fetch(`http://localhost:5000/api/photos/${photo._id}`);
      if (response.ok) {
        const fullPhoto = await response.json();
        setSelectedPhoto(fullPhoto);
        setShowPhotoModal(true);
      }
    } catch (error) {
      console.error('Error fetching photo details:', error);
    }
  };

  const handleLike = (photoId, isLiked) => {
    // Update the photo in the local state
    setUserPhotos(prevPhotos =>
      prevPhotos.map(photo =>
        photo._id === photoId
          ? { ...photo, likes: isLiked ? [...photo.likes, user] : photo.likes.filter(like => like._id !== user._id) }
          : photo
      )
    );
  };

  const handleComment = (photoId, newComment) => {
    // Update the photo in the local state
    setUserPhotos(prevPhotos =>
      prevPhotos.map(photo =>
        photo._id === photoId
          ? { ...photo, comments: [...photo.comments, newComment] }
          : photo
      )
    );
  };

  const fetchFollowers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/user/${user._id}/followers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setFollowersList(data);
      setShowFollowersModal(true);
    } catch (error) {
      console.error('Error fetching followers:', error);
    }
  };

  const fetchFollowing = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/user/${user._id}/following`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setFollowingList(data);
      setShowFollowingModal(true);
    } catch (error) {
      console.error('Error fetching following:', error);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="error">No user data found</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-cover"></div>
          <div className="profile-avatar-section">
            {user.profileImage ? (
              <img src={user.profileImage} alt={user.fullName} className="profile-avatar-large" />
            ) : (
              <div className="profile-avatar-large placeholder">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            )}
          </div>
        </div>

        <div className="profile-info">
          <h1 className="profile-name">{user.fullName}</h1>
          {user.username && <p className="profile-username">@{user.username}</p>}
          {user.bio && <p className="profile-bio">{user.bio}</p>}

          <div className="profile-stats">
            <div className="stat-item clickable" onClick={fetchFollowers}>
              <span className="stat-number">{(user.followers?.length || 0) + (user.followRequests?.length || 0)}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat-item clickable" onClick={fetchFollowing}>
              <span className="stat-number">{user.following?.length || 0}</span>
              <span className="stat-label">Following</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{Array.isArray(user.profileViews) ? user.profileViews.length : (user.profileViews || 0)}</span>
              <span className="stat-label">Views</span>
            </div>
          </div>

          <div className="profile-details">
            <h3>Profile Details</h3>
            <div className="detail-grid">
              {user.email && (
                <div className="detail-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  <div>
                    <label>Email</label>
                    <span>{user.email}</span>
                  </div>
                </div>
              )}

              {user.phoneNumber && (
                <div className="detail-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                  <div>
                    <label>Phone</label>
                    <span>{user.phoneNumber}</span>
                  </div>
                </div>
              )}

              {user.gender && (
                <div className="detail-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  <div>
                    <label>Gender</label>
                    <span>{user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}</span>
                  </div>
                </div>
              )}

              {user.birthday && (
                <div className="detail-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
                  </svg>
                  <div>
                    <label>Birthday</label>
                    <span>{new Date(user.birthday).toLocaleDateString()}</span>
                  </div>
                </div>
              )}

              {user.address && (
                <div className="detail-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <div>
                    <label>Address</label>
                    <span>{user.address}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User's Photos Section */}
        <div className="profile-photos-section">
          <h3>My Photos</h3>
          {photosLoading ? (
            <div className="photos-loading">Loading photos...</div>
          ) : userPhotos.length === 0 ? (
            <div className="no-photos">
              <p>No photos uploaded yet</p>
            </div>
          ) : (
            <div className="profile-photos-grid">
              {userPhotos.map((photo) => (
                <div key={photo._id} className="profile-photo-item" onClick={() => handlePhotoClick(photo)}>
                  <img 
                    src={photo.imageUrl[0]} 
                    alt={photo.title} 
                    className="profile-photo-image"
                  />
                  <div className="profile-photo-overlay">
                    <h4>{photo.title}</h4>
                    {photo.description && <p>{photo.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showFollowersModal && (
        <div className="modal-overlay" onClick={() => setShowFollowersModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Followers ({followersList.length})</h2>
            <div className="modal-list">
              {followersList.length === 0 ? (
                <p>No followers yet</p>
              ) : (
                followersList.map((follower) => (
                  <div key={follower._id} className="list-item">
                    <img src={follower.profileImage || '/default-avatar.png'} alt={follower.fullName} className="list-avatar" />
                    <span>{follower.fullName} {follower.status === 'pending' && '(Pending)'}</span>
                  </div>
                ))
              )}
            </div>
            <button className="close-btn" onClick={() => setShowFollowersModal(false)}>Close</button>
          </div>
        </div>
      )}

      {showFollowingModal && (
        <div className="modal-overlay" onClick={() => setShowFollowingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Following ({followingList.length})</h2>
            <div className="modal-list">
              {followingList.length === 0 ? (
                <p>Not following anyone yet</p>
              ) : (
                followingList.map((following) => (
                  <div key={following._id} className="list-item">
                    <img src={following.profileImage || '/default-avatar.png'} alt={following.fullName} className="list-avatar" />
                    <span>{following.fullName}</span>
                  </div>
                ))
              )}
            </div>
            <button className="close-btn" onClick={() => setShowFollowingModal(false)}>Close</button>
          </div>
        </div>
      )}

      {showPhotoModal && selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          onClose={() => setShowPhotoModal(false)}
          currentUser={user}
          onLike={handleLike}
          onComment={handleComment}
        />
      )}
    </div>
  );
}

export default Profile;
