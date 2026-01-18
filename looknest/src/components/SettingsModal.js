import React, { useState, useEffect } from 'react';
import './SettingsModal.css';

function SettingsModal({ isOpen, onClose, onSave }) {
  const [activeTab, setActiveTab] = useState('account');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    bio: '',
    profileImage: '',
    language: 'English',
    theme: 'light',
    notifications: true,
    privateProfile: false,
  });

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found');
        return;
      }

      const res = await fetch('http://localhost:5000/api/user/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const err = await res.json();
        console.error('Failed to fetch settings:', err);
        return;
      }

      const data = await res.json();
      setFormData({
        fullName: data.fullName || '',
        email: data.email || '',
        username: data.username || '',
        bio: data.bio || '',
        profileImage: data.profileImage || '',
        language: data.settings?.language || 'English',
        theme: data.settings?.theme || 'light',
        notifications: data.settings?.notifications ?? true,
        privateProfile: data.settings?.privateProfile ?? false,
      });

      // ✅ Apply theme immediately on modal open
      document.body.classList.toggle('dark', data.settings?.theme === 'dark');
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue,
    }));

    // ✅ Live theme preview on dropdown change
    if (name === 'theme') {
      document.body.classList.toggle('dark', value === 'dark');
    }
  };

  const handleSave = async () => {
    console.log('Save button clicked');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found');
        return;
      }

      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        username: formData.username,
        bio: formData.bio,
        profileImage: formData.profileImage,
        settings: {
          language: formData.language,
          theme: formData.theme,
          notifications: formData.notifications,
          privateProfile: formData.privateProfile
        }
      };

      console.log('Sending payload:', payload);

      const res = await fetch('http://localhost:5000/api/user/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        console.error('Save failed:', err);
        return;
      }

      const updated = await res.json();
      console.log('Saved settings:', updated);

      // ✅ Update local state so dropdown reflects saved theme
      if (updated.settings?.theme) {
        setFormData(prev => ({
          ...prev,
          theme: updated.settings.theme
        }));
        document.body.classList.toggle('dark', updated.settings.theme === 'dark');
      }

      // ✅ Notify App.js
      if (onSave) {
        onSave(updated);
      }

      onClose();
    } catch (err) {
      console.error('Error saving settings:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" key={isOpen ? 'open' : 'closed'}>
      <div className="settings-container">
        <div className="settings-sidebar">
          <button className={activeTab === 'account' ? 'active' : ''} onClick={() => setActiveTab('account')}>Account</button>
          <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>Profile</button>
          <button className={activeTab === 'privacy' ? 'active' : ''} onClick={() => setActiveTab('privacy')}>Privacy</button>
          <button className={activeTab === 'preferences' ? 'active' : ''} onClick={() => setActiveTab('preferences')}>Preferences</button>
        </div>

        <div className="settings-main">
          {activeTab === 'account' && (
            <div className="settings-section">
              <label>Full Name</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} />
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} />
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="settings-section">
              <label>Username</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} />
              <label>Bio</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange}></textarea>
              <label>Profile Image URL</label>
              <input type="text" name="profileImage" value={formData.profileImage} onChange={handleChange} />
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="settings-section toggles">
              <div className="toggle">
                <span>Private Profile</span>
                <label className="switch">
                  <input type="checkbox" name="privateProfile" checked={formData.privateProfile} onChange={handleChange} />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="toggle">
                <span>Notifications</span>
                <label className="switch">
                  <input type="checkbox" name="notifications" checked={formData.notifications} onChange={handleChange} />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="settings-section">
              <label>Language</label>
              <select name="language" value={formData.language} onChange={handleChange}>
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>Filipino</option>
              </select>
              <label>Theme</label>
              <select name="theme" value={formData.theme} onChange={handleChange}>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          )}

          <div className="settings-actions">
            <button className="save-btn" onClick={handleSave}>Save</button>
            <button className="cancel-btn" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
