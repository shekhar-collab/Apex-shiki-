const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET || 'dev-secret';

function normalizeRole(role) {
  const value = String(role || '').trim().toLowerCase();
  if (value.includes('owner') || value.includes('admin')) return 'admin';
  if (value.includes('super')) return 'superadmin';
  if (value.includes('staff')) return 'staff';
  if (value.includes('member')) return 'member';
  return value;
}

function verifyToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    if (decoded && decoded.role) decoded.role = normalizeRole(decoded.role);
    req.user = decoded; // { id, role, email, name }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    const role = (req.user && req.user.role) ? normalizeRole(req.user.role) : '';
    const allowed = roles.map((r) => normalizeRole(r));
    if (!req.user || !allowed.includes(role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    next();
  };
}

module.exports = { verifyToken, requireRole, normalizeRole };
