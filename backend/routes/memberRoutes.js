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

router.get('/me/workout', async (req, res) => {
  const member = await Member.findByPk(req.user.id, { attributes: { exclude: ['passwordHash'] } });
  if (!member) return res.status(404).json({ message: 'Member not found' });

  const exercises = Array.isArray(member.exercises) ? member.exercises : [];
  const weekPlan = Array.isArray(member.weekPlan) ? member.weekPlan : [];
  const completed = exercises.filter((exercise) => exercise?.done).length;

  return res.json({
    title: 'Today — Push Day',
    subtitle: 'Chest · Shoulders · Triceps · 45 min',
    program: 'Strength & Power Program',
    trainer: member.trainer || 'Marcus Reid',
    exercises,
    weekPlan,
    total: exercises.length,
    completed,
    isComplete: exercises.length > 0 && completed === exercises.length,
  });
});

router.patch('/me/workout', async (req, res) => {
  const member = await Member.findByPk(req.user.id);
  if (!member) return res.status(404).json({ message: 'Member not found' });

  const payload = req.body || {};
  if (Array.isArray(payload.exercises)) {
    member.exercises = payload.exercises.map((exercise, index) => ({
      name: exercise?.name || `Exercise ${index + 1}`,
      detail: exercise?.detail || '',
      done: Boolean(exercise?.done),
    }));
  }

  if (Array.isArray(payload.weekPlan)) {
    member.weekPlan = payload.weekPlan.map((item, index) => ({
      d: item?.d || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index] || `Day ${index + 1}`,
      l: item?.l || 'Workout',
      done: Boolean(item?.done),
    }));
  }

  if (payload.title) member.title = payload.title;
  if (payload.subtitle) member.subtitle = payload.subtitle;
  if (payload.trainer) member.trainer = payload.trainer;

  await member.save();

  const exercises = Array.isArray(member.exercises) ? member.exercises : [];
  const weekPlan = Array.isArray(member.weekPlan) ? member.weekPlan : [];

  return res.json({
    title: payload.title || 'Today — Push Day',
    subtitle: payload.subtitle || 'Chest · Shoulders · Triceps · 45 min',
    trainer: member.trainer || 'Marcus Reid',
    exercises,
    weekPlan,
    total: exercises.length,
    completed: exercises.filter((exercise) => exercise?.done).length,
    isComplete: exercises.length > 0 && exercises.every((exercise) => exercise?.done),
  });
});

router.patch('/me/workout/complete', async (req, res) => {
  const member = await Member.findByPk(req.user.id);
  if (!member) return res.status(404).json({ message: 'Member not found' });

  const exercises = Array.isArray(member.exercises) ? member.exercises : [];
  member.exercises = exercises.map((exercise) => ({ ...exercise, done: true }));
  await member.save();

  const completed = member.exercises.filter((exercise) => exercise?.done).length;
  return res.json({
    title: 'Today — Push Day',
    subtitle: 'Chest · Shoulders · Triceps · 45 min',
    program: 'Strength & Power Program',
    trainer: member.trainer || 'Marcus Reid',
    exercises: member.exercises,
    total: member.exercises.length,
    completed,
    isComplete: member.exercises.length > 0 && completed === member.exercises.length,
  });
});

router.patch('/me/exercises/:index', async (req, res) => {
  const member = await Member.findByPk(req.user.id);
  const idx = parseInt(req.params.index, 10);
  if (!member) return res.status(404).json({ message: 'Member not found' });
  const exercises = Array.isArray(member.exercises) ? member.exercises : [];
  if (Number.isNaN(idx) || idx < 0 || idx >= exercises.length) {
    return res.status(400).json({ message: 'Invalid exercise index' });
  }
  const nextExercise = { ...exercises[idx], done: !Boolean(exercises[idx]?.done) };
  member.exercises = exercises.map((exercise, index) => (index === idx ? nextExercise : exercise));
  await member.save();
  res.json(member.exercises);
});

module.exports = router;
