import React, { useState } from 'react';
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

function App() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [newUserData, setNewUserData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSignupComplete = (userData) => {
    setNewUserData(userData);
    setShowCreateProfile(true);
  };

  const handleProfileComplete = () => {
    setShowCreateProfile(false);
    setIsLoggedIn(true);
  };

  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1); // Trigger refresh
    setCurrentView('home'); // Switch to home view
  };

  if (!isLoggedIn && !showCreateProfile) {
    return <LandingPage onLogin={() => setIsLoggedIn(true)} onSignupComplete={handleSignupComplete} />;
  }

  if (showCreateProfile) {
    return <CreateProfile onComplete={handleProfileComplete} userData={newUserData} />;
  }

  return (
    <div className="App">
      <Navbar onProfileClick={() => setCurrentView('profile')} />
      <Sidebar 
        onNotificationClick={() => setShowNotifications(!showNotifications)}
        onUploadClick={() => setShowUpload(true)}
        onViewChange={setCurrentView}
        currentView={currentView}
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
      <main className="main-content">
        {currentView === 'home' && <MasonryGrid key={refreshKey} />}
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'messages' && <Messages />}
        {currentView === 'profile' && <Profile />}
      </main>
    </div>
  );
}

export default App;
