import React, { useState, useRef } from 'react';
import './UploadModal.css';

function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      // Compress the image
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set max dimensions
        const maxWidth = 800;
        const maxHeight = 1200;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG with 0.8 quality
        const compressedImage = canvas.toDataURL('image/jpeg', 0.8);
        setImagePreview(compressedImage);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!title || !imagePreview) {
      setError('Please provide a title and select an image');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/photos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          description,
          imageUrl: imagePreview
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Reset form
        setTitle('');
        setDescription('');
        setSelectedFile(null);
        setImagePreview(null);
        
        // Call success callback
        if (onUploadSuccess) {
          onUploadSuccess(data.photo);
        }
        
        onClose();
      } else {
        setError(data.message || 'Upload failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="upload-overlay" onClick={onClose}></div>
      <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
        <div className="upload-content">
          {error && <div className="error-message">{error}</div>}
          
          <div 
            className={`upload-dropzone ${dragActive ? 'drag-active' : ''} ${selectedFile ? 'has-file' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              className="upload-input"
              accept="image/*"
              onChange={handleFileChange}
            />
            
            {imagePreview ? (
              <div className="file-preview">
                <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }} />
                <p className="file-name">{selectedFile.name}</p>
              </div>
            ) : (
              <div className="upload-placeholder">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
                </svg>
                <p className="upload-text">Choose a file or drag and drop it here</p>
              </div>
            )}
          </div>

          <div className="upload-form">
            <div className="form-group">
              <label>Title *</label>
              <input 
                type="text" 
                placeholder="Add title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea 
                placeholder="Add a detailed description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-textarea"
                rows="4"
              />
            </div>

            <button 
              className="upload-button"
              onClick={handleUpload}
              disabled={!selectedFile || !title || loading}
            >
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default UploadModal;
