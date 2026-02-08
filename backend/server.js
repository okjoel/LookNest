const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const WebSocket = require('ws');

// Load environment variables
dotenv.config();

const app = express(); // 👈 create app first

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.log('💡 Please configure MONGODB_URI in .env file');
  });

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const photoRoutes = require('./routes/photo');
const notificationRoutes = require('./routes/notifications');
const settingsRoutes = require('./routes/settings');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/user/settings', settingsRoutes); // 👈 now mounted correctly

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'LookNest API Server Running' });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// WebSocket server
const wss = new WebSocket.Server({ server });
global.wss = wss;

wss.on('connection', (ws) => {
  console.log('WebSocket connected');
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'auth' && data.token) {
        const jwt = require('jsonwebtoken');
        try {
          const decoded = jwt.verify(data.token, process.env.JWT_SECRET);
          ws.userId = decoded.userId;
          console.log('WebSocket authenticated for user:', ws.userId);
        } catch (error) {
          console.error('WebSocket auth failed:', error);
          ws.close();
        }
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });
  ws.on('close', () => {
    console.log('WebSocket disconnected');
  });
});
