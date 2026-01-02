import React, { useState, useEffect } from 'react';
import './MasonryGrid.css';

function MasonryGrid() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/photos');
      const data = await response.json();
      setPhotos(data);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (id) => {
    console.log('Image clicked:', id);
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

  return (
    <div className="masonry-grid">
      {photos.map((photo) => (
        <div 
          key={photo._id} 
          className="masonry-item"
          onClick={() => handleImageClick(photo._id)}
        >
          <img src={photo.imageUrl} alt={photo.title} style={{ width: '100%', display: 'block', borderRadius: '16px' }} />
          <div className="image-overlay">
            <div className="image-info">
              <h3 style={{ color: 'white', fontSize: '16px', margin: '0 0 4px' }}>{photo.title}</h3>
              {photo.description && <p style={{ color: 'white', fontSize: '13px', margin: 0 }}>{photo.description}</p>}
              {photo.user && (
                <div style={{ color: 'white', fontSize: '12px', marginTop: '8px', opacity: 0.9 }}>
                  By {photo.user.fullName || photo.user.username}
                </div>
              )}
            </div>
            <div className="image-actions">
              <button className="action-btn save-btn">Save</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MasonryGrid;
