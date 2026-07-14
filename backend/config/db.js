const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/apex_gym';
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('[db] MongoDB connected:', uri);
  } catch (err) {
    console.error('[db] MongoDB connection error:', err.message);
    throw err;
  }
}

module.exports = connectDB;
