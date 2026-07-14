const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/apex_gym';
  if (!uri) {
    const msg = '[db] MONGO_URI is not set. Set MONGO_URI in your .env to a valid MongoDB connection string.';
    console.error(msg);
    throw new Error(msg);
  }
  const maxAttempts = Number(process.env.DB_CONNECT_RETRIES || 12);
  const delayMs = Number(process.env.DB_CONNECT_DELAY_MS || 2000);

  let attempt = 0;
  while (attempt < maxAttempts) {
    try {
      attempt += 1;
      console.log(`[db] Attempt ${attempt}/${maxAttempts} connecting to MongoDB...`);
      await mongoose.connect(uri);
      console.log('[db] MongoDB connected:', uri);
      return;
    } catch (err) {
      console.error(`[db] Connection attempt ${attempt} failed: ${err.message}`);
      if (attempt >= maxAttempts) {
        console.error('[db] All connection attempts failed.');
        // If in development, attempt to start an in-memory MongoDB server as a fallback
        if (process.env.NODE_ENV !== 'production') {
          try {
            console.log('[db] Starting in-memory MongoDB for development (mongodb-memory-server)...');
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const mms = await MongoMemoryServer.create();
            const memUri = mms.getUri();
            console.log('[db] In-memory MongoDB started at', memUri);
            await mongoose.connect(memUri);
            console.log('[db] Connected to in-memory MongoDB');
            return;
          } catch (memErr) {
            console.error('[db] In-memory MongoDB failed to start:', memErr.message);
            console.error('[db] Suggestion: ensure MongoDB is running and MONGO_URI is reachable. For local development run `mongod` or provide a remote URI in MONGO_URI.');
            throw memErr;
          }
        }
        console.error('[db] Suggestion: ensure MongoDB is running and MONGO_URI is reachable. For local development run `mongod` or provide a remote URI in MONGO_URI.');
        throw err;
      }
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
}

module.exports = connectDB;
