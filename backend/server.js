require('dotenv').config();
const express = require('express');
const cors = require('cors');
const net = require('net');
const fs = require('fs');
const path = require('path');
const connectDB = require('./config/db');
const demoData = require('./demoData');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const memberRoutes = require('./routes/memberRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();
const HOST = process.env.HOST || '0.0.0.0';
const DEFAULT_PORT = Number(process.env.PORT || 5000);

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

function findAvailablePort(startPort) {
  return new Promise((resolve, reject) => {
    const tester = net.createServer();

    tester.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(findAvailablePort(startPort + 1));
      } else {
        reject(err);
      }
    });

    tester.once('listening', () => {
      const address = tester.address();
      tester.close(() => resolve(address.port));
    });

    tester.listen(startPort, HOST);
  });
}

async function startServer() {
  const port = await findAvailablePort(DEFAULT_PORT);
  const runtimePortFile = path.join(__dirname, '.runtime-port');
  fs.writeFileSync(runtimePortFile, String(port), 'utf8');

  const server = app.listen(port, HOST, () => {
    console.log(`[server] ✔ Backend Started`);
    console.log(`[server] ✔ Database Connected`);
    console.log(`[server] ✔ Authentication Ready`);
    console.log(`[server] ✔ Admin Routes Loaded`);
    console.log(`[server] ✔ API Ready`);
    console.log(`[server] Running successfully on http://${HOST}:${port}`);
  });

  server.on('error', (err) => {
    console.error('[server] Failed to start server:', err.message);
    process.exit(1);
  });
}

connectDB()
  .then(() => startServer())
  .catch((err) => {
    console.error('[server] Startup failed', err);
    process.exit(1);
  });
