const express = require('express');
const { verifyToken, requireRole } = require('../middleware/auth');
const Member = require('../models/Member');

const router = express.Router();

// every route below requires a valid member JWT
router.use(verifyToken, requireRole('member'));

// full aggregated payload — mirrors exactly what the original static
// dashboard script wrote into the DOM (macros, meals, exercises, week plan,
// bookings, payments, rewards, achievements, notifications, weight history)
router.get('/me', async (req, res) => {
  const member = await Member.findByPk(req.user.id, { attributes: { exclude: ['passwordHash'] } });
  if (!member) return res.status(404).json({ message: 'Member not found' });
  res.json(member);
});

router.patch('/me', async (req, res) => {
  const updates = { ...req.body };
  delete updates.passwordHash;
  delete updates.email;
  await Member.update(updates, { where: { id: req.user.id } });
  const member = await Member.findByPk(req.user.id, { attributes: { exclude: ['passwordHash'] } });
  res.json(member);
});

router.post('/me/bookings', async (req, res) => {
  const { d, m, name, time } = req.body;
  const member = await Member.findByPk(req.user.id);
  if (!member) return res.status(404).json({ message: 'Member not found' });
  const existing = Array.isArray(member.bookings) ? member.bookings : [];
  member.bookings = [...existing, { d, m, name, time }];
  await member.save();
  res.status(201).json(member.bookings);
});

router.delete('/me/bookings/:index', async (req, res) => {
  const member = await Member.findByPk(req.user.id);
  const idx = parseInt(req.params.index, 10);
  if (Number.isNaN(idx) || idx < 0 || idx >= member.bookings.length) {
    return res.status(400).json({ message: 'Invalid booking index' });
  }
  member.bookings.splice(idx, 1);
  await member.save();
  res.json(member.bookings);
});

router.patch('/me/exercises/:index', async (req, res) => {
  const member = await Member.findByPk(req.user.id);
  const idx = parseInt(req.params.index, 10);
  if (Number.isNaN(idx) || idx < 0 || idx >= member.exercises.length) {
    return res.status(400).json({ message: 'Invalid exercise index' });
  }
  member.exercises[idx].done = !member.exercises[idx].done;
  await member.save();
  res.json(member.exercises);
});

module.exports = router;
