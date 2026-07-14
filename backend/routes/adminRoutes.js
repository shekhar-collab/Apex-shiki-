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
const Attendance = require('../models/Attendance');
const MembershipPlan = require('../models/MembershipPlan');
const FeeRecord = require('../models/FeeRecord');
const WorkoutProgram = require('../models/WorkoutProgram');
const DietPlan = require('../models/DietPlan');
const router = express.Router();

// every route below requires a valid admin JWT
router.use(verifyToken, requireRole('admin', 'superadmin', 'staff'));

function canWrite(req) {
  const role = (req.user?.role || '').toLowerCase();
  return role === 'admin' || role === 'superadmin';
}



/* ------------------------------ KPIs ------------------------------ */
router.get('/kpis', async (req, res) => {
  const kpis = await Kpi.find().sort({ order: 1 });
  res.json(kpis);
});

router.get('/dashboard-summary', async (req, res) => {
  try {
    const [members, trainers, fees, attendance, transactions, notifications] = await Promise.all([
      Member.find().select('-passwordHash').sort({ createdAt: -1 }).limit(8),
      Trainer.find().sort({ createdAt: -1 }).limit(6),
      FeeRecord.find().sort({ createdAt: -1 }).limit(10),
      Attendance.find().sort({ date: -1 }).limit(10),
      Transaction.find().sort({ createdAt: -1 }).limit(8),
      Notification.find().sort({ createdAt: -1 }).limit(6),
    ]);

    const monthlyRevenue = [52000, 61000, 59000, 69000, 74000, 82000];
    const growthSeries = [80, 95, 110, 102, 130, 148, 160, 175, 168, 190, 205, 220];
    const attendanceTrend = [72, 78, 81, 86, 90, 94];

    res.json({
      kpis: [
        { icon: 'members', label: 'Active Members', val: `${members.length}`.padStart(2, '0'), growth: '+12%', up: true, data: [42, 48, 56, 61, 69, 74] },
        { icon: 'revenue', label: 'Revenue', val: `₹${(members.length * 2200).toLocaleString()}`, growth: '+8%', up: true, data: [20, 24, 28, 31, 37, 42] },
        { icon: 'attendance', label: 'Attendance', val: `${attendance.filter((item) => item.status === 'Present').length} / ${attendance.length}` , growth: '+3%', up: true, data: [60, 64, 66, 69, 72, 74] },
      ],
      charts: {
        revenueSeries: [monthlyRevenue, monthlyRevenue.map((value) => Math.round(value * 0.48))],
        growthSeries,
        membershipDistribution: [46, 34, 20],
        paymentBreakdown: [48, 28, 16, 8],
        workoutMix: [38, 27, 20, 15],
        attendanceBreakdown: [94, 6],
        feeCollectionBreakdown: [88, 12],
        attendanceTrend,
        trainerPerformance: [92, 88, 95, 84, 90, 97],
      },
      recentMembers: members.map((member) => ({
        id: member._id,
        name: member.name,
        email: member.email,
        plan: member.plan,
        trainer: member.trainer || 'Unassigned',
        fee: member.fee,
        img: member.img,
      })),
      transactions: transactions.map((txn) => ({ ...txn.toObject() })),
      notifications: notifications.map((notif) => ({ ...notif.toObject() })),
      trainers: trainers.map((trainer) => ({ ...trainer.toObject() })),
      attendance,
      fees,
    });
  } catch (error) {
    res.status(500).json({ message: 'Could not load dashboard summary', error: error.message });
  }
});

/* ----------------------------- Members ----------------------------- */
router.get('/members', async (req, res) => {
  const { search = '', plan = '', fee = '', trainer = '' } = req.query;
  const filter = {};
  if (plan) filter.plan = new RegExp(plan, 'i');
  if (fee) filter.fee = fee;
  if (trainer) filter.trainer = new RegExp(trainer, 'i');
  if (search) {
    filter.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { trainer: new RegExp(search, 'i') },
    ];
  }
  const members = await Member.find(filter).select('-passwordHash').sort({ createdAt: -1 });
  res.json(members);
});

router.get('/members/:id', async (req, res) => {
  const member = await Member.findById(req.params.id).select('-passwordHash');
  if (!member) return res.status(404).json({ message: 'Member not found' });
  res.json(member);
});

router.post('/members', async (req, res) => {
  try {
    if (!canWrite(req)) return res.status(403).json({ message: 'Forbidden: only admins can create members' });
    const { name, email, password, plan, trainer, img, fee, att, bmi } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'Name and email are required' });
    const passwordHash = await bcrypt.hash(password || 'Member@123', 10);
    const member = await Member.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      plan: plan || 'Essential',
      trainer: trainer || '',
      img: img || '',
      join: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      fee: fee || 'gold',
      att: att || 0,
      bmi: bmi || 0,
    });
    const { passwordHash: _, ...rest } = member.toObject();
    res.status(201).json(rest);
  } catch (err) {
    res.status(400).json({ message: 'Could not create member', error: err.message });
  }
});

router.patch('/members/:id', async (req, res) => {
  try {
    if (!canWrite(req)) return res.status(403).json({ message: 'Forbidden: only admins can update members' });
    const updates = { ...req.body };
    delete updates.passwordHash;
    const member = await Member.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-passwordHash');
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json(member);
  } catch (error) {
    res.status(400).json({ message: 'Could not update member', error: error.message });
  }
});

router.delete('/members/:id', async (req, res) => {
  if (!canWrite(req)) return res.status(403).json({ message: 'Forbidden: only admins can delete members' });
  await Member.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

/* --------------------------- Attendance --------------------------- */
router.get('/attendance', async (req, res) => {
  const { search = '', status = '' } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (search) {
    filter.$or = [{ memberName: new RegExp(search, 'i') }, { notes: new RegExp(search, 'i') }];
  }
  const attendance = await Attendance.find(filter).sort({ date: -1, createdAt: -1 });
  res.json(attendance);
});

router.post('/attendance', async (req, res) => {
  try {
    if (!canWrite(req)) return res.status(403).json({ message: 'Forbidden: only admins can manage attendance' });
    const { memberName, memberId, date, status, notes, checkInTime, checkOutTime } = req.body;
    if (!memberName || !date || !status) return res.status(400).json({ message: 'Member, date and status are required' });
    const item = await Attendance.create({ memberName, memberId, date, status, notes, checkInTime, checkOutTime });
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: 'Could not create attendance record', error: error.message });
  }
});

router.patch('/attendance/:id', async (req, res) => {
  try {
    if (!canWrite(req)) return res.status(403).json({ message: 'Forbidden: only admins can manage attendance' });
    const item = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Attendance record not found' });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: 'Could not update attendance record', error: error.message });
  }
});

router.delete('/attendance/:id', async (req, res) => {
  if (!canWrite(req)) return res.status(403).json({ message: 'Forbidden: only admins can manage attendance' });
  await Attendance.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

/* --------------------------- Membership Plans --------------------------- */
router.get('/plans', async (req, res) => {
  const { search = '', status = '' } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (search) {
    filter.$or = [{ name: new RegExp(search, 'i') }, { features: { $elemMatch: { $regex: search, $options: 'i' } } }];
  }
  const plans = await MembershipPlan.find(filter).sort({ createdAt: -1 });
  res.json(plans);
});

router.post('/plans', async (req, res) => {
  try {
    if (!canWrite(req)) return res.status(403).json({ message: 'Forbidden: only admins can manage plans' });
    const plan = await MembershipPlan.create(req.body);
    res.status(201).json(plan);
  } catch (error) {
    res.status(400).json({ message: 'Could not create plan', error: error.message });
  }
});

router.patch('/plans/:id', async (req, res) => {
  try {
    if (!canWrite(req)) return res.status(403).json({ message: 'Forbidden: only admins can manage plans' });
    const plan = await MembershipPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json(plan);
  } catch (error) {
    res.status(400).json({ message: 'Could not update plan', error: error.message });
  }
});

router.delete('/plans/:id', async (req, res) => {
  if (!canWrite(req)) return res.status(403).json({ message: 'Forbidden: only admins can manage plans' });
  await MembershipPlan.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

/* --------------------------- Fee Management --------------------------- */
router.get('/fees', async (req, res) => {
  const { search = '', status = '' } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (search) {
    filter.$or = [{ memberName: new RegExp(search, 'i') }, { plan: new RegExp(search, 'i') }];
  }
  const fees = await FeeRecord.find(filter).sort({ dueDate: 1, createdAt: -1 });
  res.json(fees);
});

router.get('/pending-fees', async (req, res) => {
  const fees = await FeeRecord.find({ status: { $ne: 'Paid' } }).sort({ dueDate: 1, createdAt: -1 });
  res.json(fees);
});

router.post('/fees', async (req, res) => {
  try {
    if (!canWrite(req)) return res.status(403).json({ message: 'Forbidden: only admins can manage fees' });
    const fee = await FeeRecord.create(req.body);
    res.status(201).json(fee);
  } catch (error) {
    res.status(400).json({ message: 'Could not create fee record', error: error.message });
  }
});

router.patch('/fees/:id', async (req, res) => {
  try {
    if (!canWrite(req)) return res.status(403).json({ message: 'Forbidden: only admins can manage fees' });
    const fee = await FeeRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!fee) return res.status(404).json({ message: 'Fee record not found' });
    res.json(fee);
  } catch (error) {
    res.status(400).json({ message: 'Could not update fee record', error: error.message });
  }
});

router.delete('/fees/:id', async (req, res) => {
  if (!canWrite(req)) return res.status(403).json({ message: 'Forbidden: only admins can manage fees' });
  await FeeRecord.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

/* ----------------------------- Trainers ----------------------------- */
router.get('/trainers', async (req, res) => {
  const { search = '' } = req.query;
  const filter = search ? { $or: [{ name: new RegExp(search, 'i') }, { spec: new RegExp(search, 'i') }] } : {};
  const trainers = await Trainer.find(filter).sort({ createdAt: -1 });
  res.json(trainers);
});

router.post('/trainers', async (req, res) => {
  try {
    if (!canWrite(req)) return res.status(403).json({ message: 'Forbidden: only admins can manage trainers' });
    const trainer = await Trainer.create(req.body);
    res.status(201).json(trainer);
  } catch (error) {
    res.status(400).json({ message: 'Could not create trainer', error: error.message });
  }
});

router.patch('/trainers/:id', async (req, res) => {
  try {
    if (!canWrite(req)) return res.status(403).json({ message: 'Forbidden: only admins can manage trainers' });
    const trainer = await Trainer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!trainer) return res.status(404).json({ message: 'Trainer not found' });
    res.json(trainer);
  } catch (error) {
    res.status(400).json({ message: 'Could not update trainer', error: error.message });
  }
});

router.delete('/trainers/:id', async (req, res) => {
  if (!canWrite(req)) return res.status(403).json({ message: 'Forbidden: only admins can manage trainers' });
  await Trainer.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

/* --------------------------- Workout Programs --------------------------- */
router.get('/workouts', async (req, res) => {
  const { search = '' } = req.query;
  const filter = search ? { $or: [{ name: new RegExp(search, 'i') }, { category: new RegExp(search, 'i') }] } : {};
  const workouts = await WorkoutProgram.find(filter).sort({ createdAt: -1 });
  res.json(workouts);
});

router.post('/workouts', async (req, res) => {
  try {
    if (!canWrite(req)) return res.status(403).json({ message: 'Forbidden: only admins can manage workout programs' });
    const workout = await WorkoutProgram.create(req.body);
    res.status(201).json(workout);
  } catch (error) {
    res.status(400).json({ message: 'Could not create workout program', error: error.message });
  }
});

router.patch('/workouts/:id', async (req, res) => {
  try {
    if (!canWrite(req)) return res.status(403).json({ message: 'Forbidden: only admins can manage workout programs' });
    const workout = await WorkoutProgram.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!workout) return res.status(404).json({ message: 'Workout program not found' });
    res.json(workout);
  } catch (error) {
    res.status(400).json({ message: 'Could not update workout program', error: error.message });
  }
});

router.delete('/workouts/:id', async (req, res) => {
  if (!canWrite(req)) return res.status(403).json({ message: 'Forbidden: only admins can manage workout programs' });
  await WorkoutProgram.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

/* --------------------------- Diet Plans --------------------------- */
router.get('/diets', async (req, res) => {
  const { search = '' } = req.query;
  const filter = search ? { $or: [{ name: new RegExp(search, 'i') }, { goal: new RegExp(search, 'i') }] } : {};
  const diets = await DietPlan.find(filter).sort({ createdAt: -1 });
  res.json(diets);
});

router.post('/diets', async (req, res) => {
  try {
    if (!canWrite(req)) return res.status(403).json({ message: 'Forbidden: only admins can manage diet plans' });
    const diet = await DietPlan.create(req.body);
    res.status(201).json(diet);
  } catch (error) {
    res.status(400).json({ message: 'Could not create diet plan', error: error.message });
  }
});

router.patch('/diets/:id', async (req, res) => {
  try {
    if (!canWrite(req)) return res.status(403).json({ message: 'Forbidden: only admins can manage diet plans' });
    const diet = await DietPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!diet) return res.status(404).json({ message: 'Diet plan not found' });
    res.json(diet);
  } catch (error) {
    res.status(400).json({ message: 'Could not update diet plan', error: error.message });
  }
});

router.delete('/diets/:id', async (req, res) => {
  if (!canWrite(req)) return res.status(403).json({ message: 'Forbidden: only admins can manage diet plans' });
  await DietPlan.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

/* --------------------------- Notifications --------------------------- */
router.get('/notifications', async (req, res) => {
  const notifs = await Notification.find().sort({ createdAt: -1 }).limit(30);
  res.json(notifs);
});

/* ------------------------- Streaks (from Members) ------------------------- */
router.get('/streaks', async (req, res) => {
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
  const rewards = await RewardHistory.find().sort({ createdAt: -1 }).limit(30);
  res.json(rewards);
});

router.post('/rewards', async (req, res) => {
  const { memberId, name, img, reward } = req.body;
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
  const messages = await ContactMessage.find().sort({ createdAt: -1 });
  res.json(messages);
});

module.exports = router;
