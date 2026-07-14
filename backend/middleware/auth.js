const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET || 'dev-secret';

function verifyToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    // normalize role to lowercase for consistent checks
    if (decoded && decoded.role) decoded.role = String(decoded.role).toLowerCase();
    req.user = decoded; // { id, role, email, name }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    const role = (req.user && req.user.role) ? String(req.user.role).toLowerCase() : '';
    const allowed = roles.map(r => String(r).toLowerCase());
    if (!req.user || !allowed.includes(role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    next();
  };
}

module.exports = { verifyToken, requireRole };
