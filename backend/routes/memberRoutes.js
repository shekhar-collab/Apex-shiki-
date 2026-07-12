const express = require('express');
const { verifyToken, requireRole } = require('../middleware/auth');
const Member = require('../models/Member');
const demoData = require('../demoData');

const router = express.Router();

// every route below requires a valid member JWT
router.use(verifyToken, requireRole('member'));

// full aggregated payload — mirrors exactly what the original static
// dashboard script wrote into the DOM (macros, meals, exercises, week plan,
// bookings, payments, rewards, achievements, notifications, weight history)
router.get('/me', async (req, res) => {
  if (demoData.isDemoMode()) {
    const member = demoData.getMemberById(req.user.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    return res.json(demoData.getPublicMember(member));
  }
  const member = await Member.findById(req.user.id).select('-passwordHash');
  if (!member) return res.status(404).json({ message: 'Member not found' });
  res.json(member);
});

router.patch('/me', async (req, res) => {
  const updates = { ...req.body };
  delete updates.passwordHash;
  delete updates.email;
  if (demoData.isDemoMode()) {
    const member = demoData.updateMember(req.user.id, updates);
    return res.json(demoData.getPublicMember(member));
  }
  const member = await Member.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-passwordHash');
  res.json(member);
});

router.post('/me/bookings', async (req, res) => {
  const { d, m, name, time } = req.body;
  if (demoData.isDemoMode()) {
    const bookings = demoData.addBooking(req.user.id, { d, m, name, time });
    return res.status(201).json(bookings);
  }
  const member = await Member.findByIdAndUpdate(
    req.user.id,
    { $push: { bookings: { d, m, name, time } } },
    { new: true }
  ).select('-passwordHash');
  res.status(201).json(member.bookings);
});

router.delete('/me/bookings/:index', async (req, res) => {
  if (demoData.isDemoMode()) {
    const bookings = demoData.removeBooking(req.user.id, parseInt(req.params.index, 10));
    return bookings ? res.json(bookings) : res.status(400).json({ message: 'Invalid booking index' });
  }
  const member = await Member.findById(req.user.id);
  const idx = parseInt(req.params.index, 10);
  if (Number.isNaN(idx) || idx < 0 || idx >= member.bookings.length) {
    return res.status(400).json({ message: 'Invalid booking index' });
  }
  member.bookings.splice(idx, 1);
  await member.save();
  res.json(member.bookings);
});

router.patch('/me/exercises/:index', async (req, res) => {
  if (demoData.isDemoMode()) {
    const exercises = demoData.toggleExercise(req.user.id, parseInt(req.params.index, 10));
    return exercises ? res.json(exercises) : res.status(400).json({ message: 'Invalid exercise index' });
  }
  const member = await Member.findById(req.user.id);
  const idx = parseInt(req.params.index, 10);
  if (Number.isNaN(idx) || idx < 0 || idx >= member.exercises.length) {
    return res.status(400).json({ message: 'Invalid exercise index' });
  }
  member.exercises[idx].done = !member.exercises[idx].done;
  await member.save();
  res.json(member.exercises);
});

module.exports = router;
