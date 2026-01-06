import React, { useState, useEffect, useRef } from 'react';
import './PhotoModal.css';

const PhotoModal = ({ photo, onClose, currentUser, onLike, onComment }) => {
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
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
        setIsLiked(data.isLiked);
        setLikesCount(data.likesCount);
        onLike && onLike(photo._id, data.isLiked);
      }
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUser) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/photos/${photo._id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ text: commentText })
      });

      if (response.ok) {
        const data = await response.json();
        setComments(prev => [...prev, data.comment]);
        setCommentText('');
        onComment && onComment(photo._id, data.comment);
      }
    } catch (error) {
      console.error('Comment error:', error);
    } finally {
      setLoading(false);
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
                  disabled={!currentUser}
                >
                  ❤️ {likesCount}
                </button>
              </div>
            </div>

            <div className="photo-modal-description">
              <p>{photo.description}</p>
            </div>

            <div className="photo-modal-comments">
              <h4>Comments ({comments.length})</h4>

              <div className="comments-list">
                {comments.map((comment, index) => (
                  <div key={index} className="comment-item">
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