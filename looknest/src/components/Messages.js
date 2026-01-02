import React, { useState } from 'react';
import './Messages.css';

function Messages() {
  const [selectedChat, setSelectedChat] = useState(1);
  const [messageInput, setMessageInput] = useState('');

  const conversations = [
    {
      id: 1,
      name: 'Sarah Johnson',
      avatar: '#667eea',
      lastMessage: 'Love your latest photos! 🎨',
      time: '2m ago',
      unread: 2,
      online: true
    },
    {
      id: 2,
      name: 'Mike Chen',
      avatar: '#f093fb',
      lastMessage: 'Can I use your photo for my project?',
      time: '1h ago',
      unread: 0,
      online: true
    },
    {
      id: 3,
      name: 'Emma Wilson',
      avatar: '#4facfe',
      lastMessage: 'Thanks for the inspiration!',
      time: '3h ago',
      unread: 1,
      online: false
    },
    {
      id: 4,
      name: 'Alex Turner',
      avatar: '#43e97b',
      lastMessage: 'Great work on the new collection',
      time: '5h ago',
      unread: 0,
      online: false
    },
    {
      id: 5,
      name: 'Lisa Anderson',
      avatar: '#fa709a',
      lastMessage: 'Would love to collaborate!',
      time: '1d ago',
      unread: 0,
      online: true
    },
    {
      id: 6,
      name: 'David Kim',
      avatar: '#ffa751',
      lastMessage: 'Where was this photo taken?',
      time: '2d ago',
      unread: 0,
      online: false
    }
  ];

  const messages = [
    {
      id: 1,
      sender: 'Sarah Johnson',
      text: 'Hi! I just saw your latest upload',
      time: '10:30 AM',
      isOwn: false
    },
    {
      id: 2,
      sender: 'You',
      text: 'Thank you so much! 😊',
      time: '10:32 AM',
      isOwn: true
    },
    {
      id: 3,
      sender: 'Sarah Johnson',
      text: 'The composition is amazing. What camera do you use?',
      time: '10:33 AM',
      isOwn: false
    },
    {
      id: 4,
      sender: 'You',
      text: 'I use a Canon EOS R5. Been loving it!',
      time: '10:35 AM',
      isOwn: true
    },
    {
      id: 5,
      sender: 'Sarah Johnson',
      text: 'Love your latest photos! 🎨',
      time: '10:38 AM',
      isOwn: false
    }
  ];

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      console.log('Sending message:', messageInput);
      setMessageInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const selectedConversation = conversations.find(c => c.id === selectedChat);

  return (
    <div className="messages-container">
      <div className="conversations-panel">
        <div className="conversations-header">
          <h2>Messages</h2>
          <button className="new-message-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
          </button>
        </div>
        <div className="search-messages">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input type="text" placeholder="Search messages..." />
        </div>
        <div className="conversations-list">
          {conversations.map(conv => (
            <div 
              key={conv.id}
              className={`conversation-item ${selectedChat === conv.id ? 'active' : ''}`}
              onClick={() => setSelectedChat(conv.id)}
            >
              <div className="conversation-avatar" style={{ background: conv.avatar }}>
                {conv.name.charAt(0)}
                {conv.online && <span className="online-indicator"></span>}
              </div>
              <div className="conversation-info">
                <div className="conversation-top">
                  <h4>{conv.name}</h4>
                  <span className="conversation-time">{conv.time}</span>
                </div>
                <div className="conversation-bottom">
                  <p className="last-message">{conv.lastMessage}</p>
                  {conv.unread > 0 && (
                    <span className="unread-badge">{conv.unread}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-panel">
        <div className="chat-header">
          <div className="chat-user-info">
            <div className="chat-avatar" style={{ background: selectedConversation?.avatar }}>
              {selectedConversation?.name.charAt(0)}
            </div>
            <div>
              <h3>{selectedConversation?.name}</h3>
              <span className="user-status">
                {selectedConversation?.online ? 'Active now' : 'Offline'}
              </span>
            </div>
          </div>
          <div className="chat-actions">
            <button className="chat-action-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
              </svg>
            </button>
            <button className="chat-action-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map(message => (
            <div 
              key={message.id}
              className={`message ${message.isOwn ? 'own-message' : 'other-message'}`}
            >
              {!message.isOwn && (
                <div className="message-avatar" style={{ background: selectedConversation?.avatar }}>
                  {selectedConversation?.name.charAt(0)}
                </div>
              )}
              <div className="message-content">
                <div className="message-bubble">
                  <p>{message.text}</p>
                </div>
                <span className="message-time">{message.time}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="chat-input-container">
          <button className="attach-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
          </button>
          <input 
            type="text" 
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="emoji-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
            </svg>
          </button>
          <button 
            className="send-btn"
            onClick={handleSendMessage}
            disabled={!messageInput.trim()}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Messages;
