const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Member = require('../models/Member');
const demoData = require('../demoData');

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET || 'dev-secret';

function signToken(payload) {
  return jwt.sign(payload, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

async function findAdminByEmail(email) {
  if (demoData.isDemoMode()) {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const admin = demoData.state?.admin;
    return admin && admin.email?.toLowerCase() === normalizedEmail ? { ...admin } : null;
  }
  return Admin.findOne({ email: email.toLowerCase() });
}

async function findMemberByEmail(email) {
  if (demoData.isDemoMode()) {
    return demoData.getMemberByEmail(email);
  }
  return Member.findOne({ email: email.toLowerCase() });
}

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const admin = await findAdminByEmail(email);
    if (admin) {
      const ok = demoData.isDemoMode()
        ? bcrypt.compareSync(password, admin.passwordHash)
        : await bcrypt.compare(password, admin.passwordHash);
      if (ok) {
        const token = signToken({
          id: admin.id || admin._id,
          role: 'admin',
          email: admin.email,
          name: admin.name,
        });

        return res.json({
          token,
          user: { id: admin.id || admin._id, name: admin.name, email: admin.email, role: 'admin', img: admin.img },
        });
      }
    }

    const member = await findMemberByEmail(email);
    if (member) {
      const ok = demoData.isDemoMode()
        ? bcrypt.compareSync(password, member.passwordHash)
        : await bcrypt.compare(password, member.passwordHash);
      if (ok) {
        const token = signToken({
          id: member.id || member._id,
          role: 'member',
          email: member.email,
          name: member.name,
        });

        return res.json({
          token,
          user: { id: member.id || member._id, name: member.name, email: member.email, role: 'member', plan: member.plan, img: member.img },
        });
      }
    }

    return res.status(401).json({ message: 'Invalid credentials' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ------------------------- ADMIN AUTH ------------------------- */

router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const admin = await findAdminByEmail(email);
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = demoData.isDemoMode()
      ? bcrypt.compareSync(password, admin.passwordHash)
      : await bcrypt.compare(password, admin.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken({
      id: admin.id || admin._id,
      role: 'admin',
      email: admin.email,
      name: admin.name,
    });

    res.json({
      token,
      user: { id: admin.id || admin._id, name: admin.name, email: admin.email, role: 'admin', img: admin.img },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ------------------------- MEMBER AUTH ------------------------- */

router.post('/member/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const member = await findMemberByEmail(email);
    if (!member) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = demoData.isDemoMode()
      ? bcrypt.compareSync(password, member.passwordHash)
      : await bcrypt.compare(password, member.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken({
      id: member.id || member._id,
      role: 'member',
      email: member.email,
      name: member.name,
    });

    res.json({
      token,
      user: { id: member.id || member._id, name: member.name, email: member.email, role: 'member', plan: member.plan, img: member.img },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/member/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    const existing = await findMemberByEmail(email);
    if (existing) return res.status(409).json({ message: 'A member with this email already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    let member;
    if (demoData.isDemoMode()) {
      member = demoData.registerMember({ name, email, password });
    } else {
      member = await Member.create({
        name,
        email: email.toLowerCase(),
        passwordHash,
        plan: 'Essential',
        join: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        fee: 'gold',
      });
    }

    const token = signToken({ id: member.id || member._id, role: 'member', email: member.email, name: member.name });
    res.status(201).json({
      token,
      user: { id: member.id || member._id, name: member.name, email: member.email, role: 'member', plan: member.plan },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
