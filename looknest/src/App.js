import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MasonryGrid from './components/MasonryGrid';
import NotificationPanel from './components/NotificationPanel';
import UploadModal from './components/UploadModal';
import Dashboard from './components/Dashboard';
import Messages from './components/Messages';
import LandingPage from './components/LandingPage';
import CreateProfile from './components/CreateProfile';
import Profile from './components/Profile';
import UserProfile from './components/UserProfile';
import SettingsModal from './components/SettingsModal';
import { initSocket } from './socket';

function App() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [newUserData, setNewUserData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('home');

  useEffect(() => {
    initSocket();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/users/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
        setIsLoggedIn(true);

        // Apply theme globally
        if (userData.settings?.theme === 'dark') {
          document.body.classList.add('dark');
        } else {
          document.body.classList.remove('dark');
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const handleSignupComplete = (userData) => {
    setNewUserData(userData);
    setShowCreateProfile(true);
  };

  const handleProfileComplete = () => {
    setShowCreateProfile(false);
    setIsLoggedIn(true);
  };

  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    document.body.classList.remove('dark'); // reset theme
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleUserClick = (userId) => {
    setSelectedUserId(userId);
  };

  const handleMessage = () => {
    // For now, just switch to messages route
  };

  const handleSaveSettings = (data) => {
    console.log('Saved settings:', data);

    // Apply theme instantly after Save
    if (data.settings?.theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  };

  if (!isLoggedIn && !showCreateProfile) {
    return (
      <LandingPage 
        onLogin={() => setIsLoggedIn(true)} 
        onSignupComplete={handleSignupComplete} 
      />
    );
  }

  if (showCreateProfile) {
    return (
      <CreateProfile 
        onComplete={handleProfileComplete} 
        userData={newUserData} 
      />
    );
  }

  return (
    <div className="App">
      <Navbar
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        onSearch={handleSearch}
        currentUser={currentUser}
        onProfileClick={() => setCurrentView('profile')}
      />
      <Sidebar
        onViewChange={setCurrentView}
        currentUser={currentUser}
        onUploadClick={() => setShowUpload(true)}
        onNotificationClick={() => setShowNotifications((prev) => !prev)}
        onLogout={handleLogout}
        onSettingsClick={() => setShowSettings(true)}
      />
      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
      <UploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Settings Modal (merged from PR) */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={handleSaveSettings}
      />

      <main className="main-content">
        {currentView === 'home' && (
          <MasonryGrid
            key={refreshKey}
            searchQuery={searchQuery}
            onUserClick={handleUserClick}
            currentUser={currentUser}
            onNavigate={setCurrentView}
          />
        )}
        {currentView === 'dashboard' && <Dashboard currentUser={currentUser} />}
        {currentView === 'messages' && <Messages />}
        {currentView === 'profile' && <Profile />}
        {currentView === 'user-profile' && (
          <UserProfile userId={selectedUserId} onMessage={handleMessage} />
        )}
      </main>
    </div>
  );
}

export default App;
