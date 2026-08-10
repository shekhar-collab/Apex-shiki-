const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const Admin = require('./models/Admin');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const memberRoutes = require('./routes/memberRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();
const HOST = process.env.HOST || '0.0.0.0';
const DEFAULT_PORT = Number(process.env.PORT || 5001);

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

async function startServer() {
  const port = DEFAULT_PORT;

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

async function bootstrap() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    // ensure an admin user exists for first-time login
    try {
      const bcrypt = require('bcryptjs');
      const adminCount = await Admin.count();
      if (!adminCount) {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@apex.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
        const hash = await bcrypt.hash(adminPassword, 10);
        await Admin.create({ name: 'Apex Admin', email: adminEmail.toLowerCase(), passwordHash: hash, role: 'superadmin' });
        console.log('[server] Initial admin user created:', adminEmail);
      }
    } catch (err) {
      console.warn('[server] Could not ensure admin user exists:', err.message);
    }
    await startServer();
  } catch (err) {
    console.error('[server] Startup failed — could not initialize SQLite database');
    console.error('[server] Error:', err.message);
    process.exit(1);
  }
}

bootstrap();
