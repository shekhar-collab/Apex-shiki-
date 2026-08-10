const express = require('express');
const ContactMessage = require('../models/ContactMessage');
const Trainer = require('../models/Trainer');
const MembershipPlan = require('../models/MembershipPlan');
const WorkoutProgram = require('../models/WorkoutProgram');
const DietPlan = require('../models/DietPlan');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, message } = req.body;
    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const entry = await ContactMessage.create({ firstName, lastName, email, message });
    res.status(201).json({ message: 'Thanks — we will get back to you soon.', id: entry.id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// public — landing page and member panel use this shared live content
router.get('/trainers-public', async (req, res) => {
  const trainers = await Trainer.findAll({ order: [['createdAt', 'DESC']] });
  res.json(trainers);
});

router.get('/plans-public', async (req, res) => {
  const plans = await MembershipPlan.findAll({ order: [['createdAt', 'DESC']] });
  res.json(plans);
});

router.get('/workouts-public', async (req, res) => {
  const workouts = await WorkoutProgram.findAll({ order: [['createdAt', 'DESC']] });
  res.json(workouts);
});

router.get('/diets-public', async (req, res) => {
  const diets = await DietPlan.findAll({ order: [['createdAt', 'DESC']] });
  res.json(diets);
});

router.get('/home-content', async (req, res) => {
  const [trainers, plans, workouts, diets] = await Promise.all([
    Trainer.findAll({ order: [['createdAt', 'DESC']] }),
    MembershipPlan.findAll({ order: [['createdAt', 'DESC']] }),
    WorkoutProgram.findAll({ order: [['createdAt', 'DESC']] }),
    DietPlan.findAll({ order: [['createdAt', 'DESC']] }),
  ]);

  res.json({ trainers, plans, workouts, diets });
});

module.exports = router;
