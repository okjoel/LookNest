const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { MongoMemoryServer } = require('mongodb-memory-server');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const photoRoutes = require('./routes/photo');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// In-Memory MongoDB Setup (for testing without Atlas)
async function startServer() {
  try {
    console.log('🔄 Starting in-memory MongoDB...');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    
    await mongoose.connect(uri);
    console.log('✅ In-Memory MongoDB Connected');
    console.log('⚠️  Data will be lost when server stops (testing only)');
    
    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/user', userRoutes);
    app.use('/api/photos', photoRoutes);

    // Test route
    app.get('/', (req, res) => {
      res.json({ message: 'LookNest API Test Server Running' });
    });

    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Test Server running on http://localhost:${PORT}`);
      console.log('📝 Use this for testing signup/login without MongoDB Atlas');
    });
  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
}

startServer();
