require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const demoData = require('./demoData');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const memberRoutes = require('./routes/memberRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const buildCorsOrigin = () => {
  if (allowedOrigins.length === 0) {
    return true;
  }

  return (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    const normalizedOrigin = origin.replace(/\/$/, '');
    const allowed = allowedOrigins.some((candidate) => normalizedOrigin === candidate.replace(/\/$/, ''));

    if (allowed || /^http:\/\/localhost:\d+$/.test(normalizedOrigin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(normalizedOrigin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  };
};

app.use(
  cors({
    origin: buildCorsOrigin(),
    credentials: true,
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'apex-backend' }));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/member', memberRoutes);
app.use('/api/contact', contactRoutes);

// 404
app.use('/api', (req, res) => res.status(404).json({ message: 'Not found' }));

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Unexpected server error' });
});

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, 'localhost', () => {
    console.log(`[server] APEX backend running on http://localhost:${PORT}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[server] Port ${PORT} is in use. Please free the port or change PORT env var.`);
      process.exit(1);
    } else {
      throw err;
    }
  });
}).catch((err) => {
  console.error('[server] Startup failed', err);
  process.exit(1);
});
