require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find({});
    console.log('Users in database:', users.length);
    users.forEach(u => console.log(`${u.email} - ${u.fullName}`));
    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkUsers();