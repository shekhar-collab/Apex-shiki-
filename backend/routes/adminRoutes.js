const express = require('express');
const bcrypt = require('bcryptjs');
const { verifyToken, requireRole } = require('../middleware/auth');
const Member = require('../models/Member');
const Trainer = require('../models/Trainer');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const RewardHistory = require('../models/RewardHistory');
const Kpi = require('../models/Kpi');
const ContactMessage = require('../models/ContactMessage');
const demoData = require('../demoData');

const router = express.Router();

// every route below requires a valid admin JWT
router.use(verifyToken, requireRole('admin'));

/* ------------------------------ KPIs ------------------------------ */
router.get('/kpis', async (req, res) => {
  if (demoData.isDemoMode()) {
    return res.json(demoData.state.kpis);
  }
  const kpis = await Kpi.find().sort({ order: 1 });
  res.json(kpis);
});

/* ----------------------------- Members ----------------------------- */
router.get('/members', async (req, res) => {
  if (demoData.isDemoMode()) {
    return res.json(demoData.getPublicMembers(demoData.state.members));
  }
  const members = await Member.find().select('-passwordHash').sort({ createdAt: -1 });
  res.json(members);
});

router.get('/members/:id', async (req, res) => {
  if (demoData.isDemoMode()) {
    const member = demoData.getMemberById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    return res.json(demoData.getPublicMember(member));
  }
  const member = await Member.findById(req.params.id).select('-passwordHash');
  if (!member) return res.status(404).json({ message: 'Member not found' });
  res.json(member);
});

router.post('/members', async (req, res) => {
  try {
    const { name, email, password, plan, trainer, img } = req.body;
    const passwordHash = await bcrypt.hash(password || 'Member@123', 10);
    const member = await Member.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      plan: plan || 'Essential',
      trainer: trainer || '',
      img: img || '',
      join: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      fee: 'gold',
    });
    const { passwordHash: _, ...rest } = member.toObject();
    res.status(201).json(rest);
  } catch (err) {
    res.status(400).json({ message: 'Could not create member', error: err.message });
  }
});

router.patch('/members/:id', async (req, res) => {
  const updates = { ...req.body };
  delete updates.passwordHash;
  const member = await Member.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-passwordHash');
  if (!member) return res.status(404).json({ message: 'Member not found' });
  res.json(member);
});

router.delete('/members/:id', async (req, res) => {
  await Member.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

/* --------------------------- Transactions --------------------------- */
router.get('/transactions', async (req, res) => {
  if (demoData.isDemoMode()) {
    return res.json(demoData.state.transactions);
  }
  const txns = await Transaction.find().sort({ createdAt: -1 }).limit(50);
  res.json(txns);
});

router.post('/transactions', async (req, res) => {
  const txn = await Transaction.create(req.body);
  res.status(201).json(txn);
});

/* ----------------------------- Trainers ----------------------------- */
router.get('/trainers', async (req, res) => {
  if (demoData.isDemoMode()) {
    return res.json(demoData.state.trainers);
  }
  const trainers = await Trainer.find().sort({ createdAt: -1 });
  res.json(trainers);
});

router.post('/trainers', async (req, res) => {
  const trainer = await Trainer.create(req.body);
  res.status(201).json(trainer);
});

/* --------------------------- Notifications --------------------------- */
router.get('/notifications', async (req, res) => {
  if (demoData.isDemoMode()) {
    return res.json(demoData.state.notifications);
  }
  const notifs = await Notification.find().sort({ createdAt: -1 }).limit(30);
  res.json(notifs);
});

/* ------------------------- Streaks (from Members) ------------------------- */
router.get('/streaks', async (req, res) => {
  if (demoData.isDemoMode()) {
    const streaks = demoData.state.members
      .filter((m) => (m.streak?.current || 0) > 0)
      .map((m) => ({
        id: m.id,
        name: m.name,
        img: m.img,
        current: m.streak?.current || 0,
        longest: m.streak?.longest || 0,
        last: m.streak?.last || '',
        tier: m.streak?.tier || 'bronze',
      }))
      .sort((a, b) => b.current - a.current);
    return res.json(streaks);
  }
  const members = await Member.find({ 'streak.current': { $gt: 0 } })
    .select('name img streak')
    .sort({ 'streak.current': -1 });
  const streaks = members.map((m) => ({
    id: m._id,
    name: m.name,
    img: m.img,
    current: m.streak?.current || 0,
    longest: m.streak?.longest || 0,
    last: m.streak?.last || '',
    tier: m.streak?.tier || 'bronze',
  }));
  res.json(streaks);
});

/* ------------------------------ Rewards ------------------------------ */
router.get('/rewards', async (req, res) => {
  if (demoData.isDemoMode()) {
    return res.json(demoData.state.rewards);
  }
  const rewards = await RewardHistory.find().sort({ createdAt: -1 }).limit(30);
  res.json(rewards);
});

router.post('/rewards', async (req, res) => {
  const { memberId, name, img, reward } = req.body;
  if (demoData.isDemoMode()) {
    const entry = demoData.addReward(memberId, { name, img, reward });
    return res.status(201).json(entry);
  }
  const entry = await RewardHistory.create({
    member: memberId,
    name,
    img,
    reward,
    time: 'Just now',
  });
  if (memberId) {
    await Member.findByIdAndUpdate(memberId, {
      $push: { rewards: { $each: [{ name: reward, from: 'Apex Team', time: 'Just now' }], $position: 0 } },
    });
  }
  res.status(201).json(entry);
});

/* --------------------------- Contact messages --------------------------- */
router.get('/contact-messages', async (req, res) => {
  if (demoData.isDemoMode()) {
    return res.json(demoData.state.contactMessages);
  }
  const messages = await ContactMessage.find().sort({ createdAt: -1 });
  res.json(messages);
});

module.exports = router;
