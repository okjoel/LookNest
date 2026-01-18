import React, { useState, useEffect, useRef } from 'react';
import './PhotoModal.css';

const PhotoModal = ({ photo, onClose, currentUser, onLike, onComment }) => {
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const commentInputRef = useRef(null);

  useEffect(() => {
    if (photo) {
      setIsLiked(photo.likes?.some(like => like._id === currentUser?._id) || false);
      setLikesCount(photo.likes?.length || 0);
      setComments(photo.comments || []);
    }
  }, [photo, currentUser]);

const handleLike = async () => {
  if (!currentUser) return;

  // Optimistic UI update
  setIsLiked(prev => !prev);
  setLikesCount(prev => prev + (isLiked ? -1 : 1));

  try {
    const response = await fetch(`/api/photos/${photo._id}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      // Sync with server response in case of mismatch
      setIsLiked(data.isLiked);
      setLikesCount(data.likesCount);
      onLike && onLike(photo._id, data.isLiked);
    }
  } catch (error) {
    console.error('Like error:', error);
    // Rollback if request fails
    setIsLiked(prev => !prev);
    setLikesCount(prev => prev + (isLiked ? 1 : -1));
  }
};

const handleComment = async (e) => {
  e.preventDefault();
  if (!commentText.trim() || !currentUser) return;

  const tempId = Date.now().toString();
  const newComment = {
    _id: tempId,
    text: commentText,
    user: currentUser,
    createdAt: new Date().toISOString(),
    isTemp: true
  };

  setComments(prev => [...prev, newComment]);
  setCommentText('');
  commentInputRef.current?.focus();

  try {
    const response = await fetch(`/api/photos/${photo._id}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ text: newComment.text })
    });

    if (response.ok) {
      const data = await response.json();
      // Replace temp comment with real one
      setComments(prev =>
        prev.map(c => c._id === tempId ? data.comment : c)
      );
      onComment && onComment(photo._id, data.comment);
    } else {
      console.error('Server failed to save comment');
      // ❌ Don’t remove the temp comment immediately
      // Instead, maybe mark it as "unsynced"
      setComments(prev =>
        prev.map(c => c._id === tempId ? { ...c, error: true } : c)
      );
    }
  } catch (error) {
    console.error('Comment error:', error);
    // Same idea: mark as error instead of removing
    setComments(prev =>
      prev.map(c => c._id === tempId ? { ...c, error: true } : c)
    );
  }
};


  const handleEditComment = async (commentId, oldText) => {
    const newText = prompt('Edit your comment:', oldText);
    if (!newText || !newText.trim()) return;
    try {
      const response = await fetch(`/api/photos/${photo._id}/comment/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ text: newText })
      });
      if (response.ok) {
        const data = await response.json();
        setComments(prev =>
          prev.map(c => c._id === commentId ? { ...c, text: data.comment.text } : c)
        );
      }
    } catch (error) {
      console.error('Edit error:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      const response = await fetch(`/api/photos/${photo._id}/comment/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        setComments(prev => prev.filter(c => c._id !== commentId));
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;
    try {
      const response = await fetch(`/api/photos/${photo._id}/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        window.location.href = `/profile/${currentUser.username}`;
      }
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!photo) return null;

  return (
    <div className="photo-modal-overlay" onClick={onClose}>
      <div className="photo-modal-content" onClick={e => e.stopPropagation()}>
        <button className="photo-modal-close" onClick={onClose}>&times;</button>

        <div className="photo-modal-body">
          <div className="photo-modal-image">
            <img src={photo.imageUrl} alt={photo.title} />
          </div>

          <div className="photo-modal-details">
            <div className="photo-modal-header">
              <div className="photo-modal-user">
                <img
                  src={photo.user?.profileImage || '/default-avatar.png'}
                  alt={photo.user?.fullName}
                  className="photo-modal-avatar"
                />
                <div>
                  <h3>{photo.user?.fullName}</h3>
                  <p>@{photo.user?.username}</p>
                </div>
              </div>
              <div className="photo-modal-stats">
                <button
                  className={`like-button ${isLiked ? 'liked' : ''}`}
                  onClick={handleLike}
                  disabled={!currentUser || likeLoading}
                >
                  {isLiked ? '❤️' : '🤍'} {likesCount}
                </button>
                <button className="save-button" onClick={handleSave} disabled={!currentUser}>
                  📌 Save
                </button>
              </div>
            </div>

            <div className="photo-modal-description">
              <p>{photo.description}</p>
            </div>

            <div className="photo-modal-comments">
              <h4>Comments ({comments.length})</h4>

              <div className="comments-list">
                {comments.map((comment) => (
                  <div key={comment._id || comment.createdAt} className="comment-item">
                    <img
                      src={comment.user?.profileImage || '/default-avatar.png'}
                      alt={comment.user?.fullName}
                      className="comment-avatar"
                    />
                    <div className="comment-content">
                      <div className="comment-header">
                        <span className="comment-user">{comment.user?.fullName}</span>
                        <span className="comment-date">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="comment-text">{comment.text}</p>
                      {currentUser?._id === comment.user?._id && (
                        <div className="comment-actions">
                          <button onClick={() => handleEditComment(comment._id, comment.text)}>Edit</button>
                          <button onClick={() => handleDeleteComment(comment._id)}>Delete</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {currentUser && (
                <form className="comment-form" onSubmit={handleComment}>
                  <img
                    src={currentUser.profileImage || '/default-avatar.png'}
                    alt={currentUser.fullName}
                    className="comment-avatar"
                  />
                  <input
                    ref={commentInputRef}
                    type="text"
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    disabled={loading}
                  />
                  <button type="submit" disabled={!commentText.trim() || loading}>
                    {loading ? 'Posting...' : 'Post'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoModal;
