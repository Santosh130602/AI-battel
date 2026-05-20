const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-battle-room';
  
  await mongoose.connect(uri);
  console.log('✅ MongoDB connected:', uri);
  
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err);
  });
  
  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });
}

module.exports = connectDB;
