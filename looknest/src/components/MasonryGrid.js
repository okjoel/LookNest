import React, { useState, useEffect } from 'react';
import './MasonryGrid.css';
import PhotoModal from './PhotoModal';

function MasonryGrid({ searchQuery, onUserClick, currentUser, onNavigate }) {
  const [allPhotos, setAllPhotos] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setPhotos(allPhotos);
    } else {
      const filtered = allPhotos.filter(photo => 
        photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (photo.user && photo.user.fullName && photo.user.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (photo.user && photo.user.username && photo.user.username.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setPhotos(filtered);
    }
  }, [searchQuery, allPhotos]);

  const fetchPhotos = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/photos');
      const data = await response.json();
      setAllPhotos(data);
      setPhotos(data);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = async (photo) => {
    try {
      // Fetch full photo details with comments and likes
      const response = await fetch(`http://localhost:5000/api/photos/${photo._id}`);
      if (response.ok) {
        const fullPhoto = await response.json();
        setSelectedPhoto(fullPhoto);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error fetching photo details:', error);
    }
  };

  const handleLike = (photoId, isLiked) => {
    // Update the photo in the local state
    setPhotos(prevPhotos =>
      prevPhotos.map(photo =>
        photo._id === photoId
          ? { ...photo, likes: isLiked ? [...photo.likes, currentUser] : photo.likes.filter(like => like._id !== currentUser._id) }
          : photo
      )
    );
  };

  const handleComment = (photoId, newComment) => {
    // Update the photo in the local state
    setPhotos(prevPhotos =>
      prevPhotos.map(photo =>
        photo._id === photoId
          ? { ...photo, comments: [...photo.comments, newComment] }
          : photo
      )
    );
  };

  if (loading) {
    return (
      <div className="masonry-grid">
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666', gridColumn: '1 / -1' }}>
          Loading photos...
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="masonry-grid">
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666', gridColumn: '1 / -1' }}>
          <p style={{ fontSize: '18px', marginBottom: '10px' }}>No photos yet</p>
          <p style={{ fontSize: '14px' }}>Upload your first photo to get started!</p>
        </div>
      </div>
    );
  }

  const handleSavePhoto = async (photoId) => {
    try {
      const response = await fetch(`/api/photos/${photoId}/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        if (onNavigate) onNavigate('dashboard');
      } else {
        alert('Failed to save photo');
      }
    } catch (error) {
      alert('Error saving photo');
    }
  };

  return (
    <>
      <div className="masonry-grid">
        {photos.map((photo) => (
          <div 
            key={photo._id} 
            className="masonry-item"
            onClick={() => handleImageClick(photo)}
          >
            <img src={photo.imageUrl[0]} alt={photo.title} style={{ width: '100%', display: 'block', borderRadius: '16px' }} />
            {photo.imageUrl.length > 1 && (
              <div className="image-count">+{photo.imageUrl.length - 1}</div>
            )}
            <div className="image-overlay">
              <div className="image-info">
                <h3 style={{ color: 'white', fontSize: '16px', margin: '0 0 4px' }}>{photo.title}</h3>
                {photo.description && <p style={{ color: 'white', fontSize: '13px', margin: 0 }}>{photo.description}</p>}
                {photo.user && (
                  <div 
                    style={{ color: 'white', fontSize: '12px', marginTop: '8px', opacity: 0.9, cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onUserClick) {
                        onUserClick(photo.user._id);
                      }
                    }}
                  >
                    By <span style={{ textDecoration: 'underline' }}>{photo.user.fullName || photo.user.username}</span>
                  </div>
                )}
              </div>
              <div className="image-actions">
                <button className="action-btn save-btn" onClick={(e) => { e.stopPropagation(); handleSavePhoto(photo._id); }}>Save</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          onClose={() => setShowModal(false)}
          currentUser={currentUser}
          onLike={handleLike}
          onComment={handleComment}
        />
      )}
    </>
  );
}

export default MasonryGrid;
