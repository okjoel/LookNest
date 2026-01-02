import React from 'react';
import './NotificationPanel.css';

function NotificationPanel({ isOpen, onClose }) {
  const notifications = [
    {
      id: 1,
      image: 'notification-1',
      title: "You'd vibe with this",
      time: '31m',
      type: 'new'
    },
    {
      id: 2,
      image: 'notification-2',
      title: "This is so you-coded",
      time: '4h',
      type: 'new'
    },
    {
      id: 3,
      image: 'notification-3',
      title: "Your taste is next level",
      time: '8h',
      type: 'new'
    },
    {
      id: 4,
      image: 'notification-4',
      title: "Big mood",
      time: '1d',
      type: 'new'
    },
    {
      id: 5,
      image: 'notification-5',
      title: "Your taste is next level",
      time: '1d',
      type: 'new'
    },
    {
      id: 6,
      image: 'notification-6',
      title: "Ideas as original as you",
      time: '2d',
      type: 'seen'
    },
    {
      id: 7,
      image: 'notification-7',
      title: "This is so you-coded",
      time: '2d',
      type: 'seen'
    },
    {
      id: 8,
      image: 'notification-8',
      title: "Your taste is next level",
      time: '3d',
      type: 'seen'
    }
  ];

  if (!isOpen) return null;

  return (
    <>
      <div className="notification-overlay" onClick={onClose}></div>
      <div className="notification-panel">
        <div className="notification-header">
          <h2>Updates</h2>
        </div>
        
        <div className="notification-content">
          <div className="notification-section">
            <h3>New</h3>
            {notifications.filter(n => n.type === 'new').map(notification => (
              <div key={notification.id} className="notification-item">
                <div className="notification-thumbnail">
                  <svg width="48" height="64" viewBox="0 0 48 64" fill="none">
                    <rect width="48" height="64" rx="8" fill="#e3f2fd"/>
                    <rect x="8" y="8" width="32" height="4" rx="2" fill="#90caf9"/>
                    <rect x="8" y="16" width="24" height="3" rx="1.5" fill="#64b5f6"/>
                    <rect x="8" y="22" width="28" height="3" rx="1.5" fill="#64b5f6"/>
                    <rect x="8" y="32" width="32" height="20" rx="4" fill="#42a5f5"/>
                  </svg>
                </div>
                <div className="notification-details">
                  <p className="notification-title">{notification.title}</p>
                </div>
                <div className="notification-meta">
                  <span className="notification-time">{notification.time}</span>
                  <button className="notification-menu">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="5" r="2"/>
                      <circle cx="12" cy="12" r="2"/>
                      <circle cx="12" cy="19" r="2"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="notification-section">
            <h3>Seen</h3>
            {notifications.filter(n => n.type === 'seen').map(notification => (
              <div key={notification.id} className="notification-item seen">
                <div className="notification-thumbnail">
                  <svg width="48" height="64" viewBox="0 0 48 64" fill="none">
                    <rect width="48" height="64" rx="8" fill="#f0f4f8"/>
                    <rect x="8" y="8" width="32" height="4" rx="2" fill="#cbd5e0"/>
                    <rect x="8" y="16" width="24" height="3" rx="1.5" fill="#e2e8f0"/>
                    <rect x="8" y="22" width="28" height="3" rx="1.5" fill="#e2e8f0"/>
                    <rect x="8" y="32" width="32" height="20" rx="4" fill="#a0aec0"/>
                  </svg>
                </div>
                <div className="notification-details">
                  <p className="notification-title">{notification.title}</p>
                </div>
                <div className="notification-meta">
                  <span className="notification-time">{notification.time}</span>
                  <button className="notification-menu">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="5" r="2"/>
                      <circle cx="12" cy="12" r="2"/>
                      <circle cx="12" cy="19" r="2"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default NotificationPanel;
