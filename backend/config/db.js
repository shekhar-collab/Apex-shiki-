const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/apex_gym';
  const useDemo = process.env.USE_DEMO_DATA === 'true' || (!process.env.MONGO_URI && !process.env.MONGODB_URI);

  if (useDemo) {
    process.env.USE_DEMO_DATA = 'true';
    console.log('[db] Demo mode enabled; skipping MongoDB connection');
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log('[db] MongoDB connected:', uri);
  } catch (err) {
    console.error('[db] MongoDB connection error:', err.message);
    console.log('[db] Falling back to demo mode. Set USE_DEMO_DATA=true to suppress this warning.');
    process.env.USE_DEMO_DATA = 'true';
  }
}

module.exports = connectDB;
