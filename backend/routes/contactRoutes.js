const express = require('express');
const ContactMessage = require('../models/ContactMessage');
const Trainer = require('../models/Trainer');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, message } = req.body;
    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const entry = await ContactMessage.create({ firstName, lastName, email, message });
    res.status(201).json({ message: 'Thanks — we will get back to you soon.', id: entry._id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// public — landing page also shows live trainer roster
router.get('/trainers-public', async (req, res) => {
  const trainers = await Trainer.find();
  res.json(trainers);
});

module.exports = router;
