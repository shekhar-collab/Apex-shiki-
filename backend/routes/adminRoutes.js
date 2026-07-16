const express = require('express');
const bcrypt = require('bcryptjs');
const { Op, fn, col, literal } = require('sequelize');
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
const sequelize = require('../config/database');
const router = express.Router();

// every route below requires a valid admin JWT
router.use(verifyToken, requireRole('admin', 'superadmin', 'staff'));

function canWrite(req) {
  const role = (req.user?.role || '').toLowerCase();
  return role === 'admin' || role === 'superadmin';
}

function parsePagination(req) {
  const p = Number.parseInt(req.query.page, 10);
  const l = Number.parseInt(req.query.limit, 10);
  const page = Number.isNaN(p) ? 1 : Math.max(1, p);
  const limit = Number.isNaN(l) ? 20 : Math.min(100, Math.max(1, l));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

function isEmail(s) {
  return typeof s === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s);
}

/* ------------------------------ KPIs ------------------------------ */
router.get('/kpis', async (req, res) => {
  try {
    const kpis = await Kpi.findAll({ order: [['order', 'ASC']] });
    res.json(kpis);
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch KPIs', error: err.message });
  }
});

router.get('/dashboard-summary', async (req, res) => {
  try {
    const [recentMembers, recentTrainers, recentFees, recentAttendance, recentTransactions, recentNotifications] = await Promise.all([
      Member.findAll({ attributes: { exclude: ['passwordHash'] }, order: [['createdAt', 'DESC']], limit: 8 }),
      Trainer.findAll({ order: [['createdAt', 'DESC']], limit: 6 }),
      FeeRecord.findAll({ order: [['createdAt', 'DESC']], limit: 10 }),
      Attendance.findAll({ order: [['createdAt', 'DESC']], limit: 10 }),
      Transaction.findAll({ order: [['createdAt', 'DESC']], limit: 12 }),
      Notification.findAll({ order: [['createdAt', 'DESC']], limit: 6 }),
    ]);

    const totalMembers = await Member.count();
    const totalTrainers = await Trainer.count();
    const totalAttendance = await Attendance.count();

    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const monthlyRevenue = new Array(12).fill(0);
    const growthSeries = new Array(12).fill(0);
    const attendanceTrend = new Array(6).fill(0);

    const txns = await Transaction.findAll({ where: { createdAt: { [Op.gte]: startOfYear } }, attributes: ['amt', 'createdAt'] });
    txns.forEach((txn) => {
      const date = txn.createdAt || new Date();
      const index = date.getFullYear() === now.getFullYear() ? date.getMonth() : ((date.getMonth() - now.getMonth() + 12) % 12);
      monthlyRevenue[index] += Number(txn.amt || 0) || 0;
    });

    const membersLastYear = await Member.findAll({ where: { createdAt: { [Op.gte]: startOfYear } }, attributes: ['createdAt'] });
    membersLastYear.forEach((member) => {
      const date = member.createdAt || new Date();
      const index = date.getFullYear() === now.getFullYear() ? date.getMonth() : ((date.getMonth() - now.getMonth() + 12) % 12);
      growthSeries[index] += 1;
    });

    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const attendRecords = await Attendance.findAll({ where: { createdAt: { [Op.gte]: sixMonthsAgo } }, attributes: ['createdAt', 'status'] });
    attendRecords.forEach((rec) => {
      const date = rec.createdAt || new Date();
      const diff = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
      if (diff >= 0 && diff < 6) {
        attendanceTrend[5 - diff] += rec.status === 'Present' ? 1 : 0;
      }
    });

    const planAgg = await Member.findAll({
      attributes: ['plan', [fn('COUNT', col('plan')), 'count']],
      group: ['plan'],
    });
    const membershipDistribution = planAgg.map((p) => Number(p.get('count')));

    const feeAgg = await FeeRecord.findAll({
      attributes: ['status', [fn('COUNT', col('status')), 'count']],
      group: ['status'],
    });
    const paymentBreakdown = ['Paid', 'Pending', 'Overdue', 'Other'].map((status) => {
      const item = feeAgg.find((f) => f.status === status);
      return item ? Number(item.get('count')) : 0;
    });

    const trainerAgg = await Member.findAll({
      attributes: ['trainer', [fn('COUNT', col('trainer')), 'count']],
      group: ['trainer'],
      order: [[literal('count'), 'DESC']],
      limit: 6,
    });
    const trainerPerformance = trainerAgg.map((item) => Number(item.get('count')));

    res.json({
      kpis: [
        { icon: 'members', label: 'Active Members', val: `${totalMembers}`.padStart(2, '0'), growth: `${growthSeries[growthSeries.length - 1] || 0} new`, up: true, data: growthSeries.slice(-6) },
        { icon: 'revenue', label: 'Revenue', val: `₹${monthlyRevenue.reduce((sum, value) => sum + value, 0).toLocaleString()}`, growth: '+8%', up: true, data: monthlyRevenue.slice(-6) },
        { icon: 'attendance', label: 'Attendance', val: `${attendRecords.filter((item) => item.status === 'Present').length} / ${attendRecords.length || totalAttendance}`, growth: '+3%', up: true, data: attendanceTrend },
      ],
      charts: {
        revenueSeries: [monthlyRevenue, monthlyRevenue.map((value) => Math.round(value * 0.48))],
        growthSeries,
        membershipDistribution,
        paymentBreakdown,
        workoutMix: [38, 27, 20, 15],
        attendanceBreakdown: [
          Math.round((attendRecords.filter((a) => a.status === 'Present').length / (attendRecords.length || 1)) * 100),
          Math.max(0, 100 - Math.round((attendRecords.filter((a) => a.status === 'Present').length / (attendRecords.length || 1)) * 100)),
        ],
        feeCollectionBreakdown: paymentBreakdown,
        attendanceTrend,
        trainerPerformance,
      },
      recentMembers: recentMembers.map((member) => ({
        id: member.id,
        name: member.name,
        email: member.email,
        plan: member.plan,
        trainer: member.trainer || 'Unassigned',
        fee: member.fee,
        img: member.img,
      })),
      transactions: recentTransactions.map((txn) => txn.toJSON()),
      notifications: recentNotifications.map((notif) => notif.toJSON()),
      trainers: recentTrainers.map((trainer) => trainer.toJSON()),
      attendance: recentAttendance.map((record) => record.toJSON()),
      fees: recentFees.map((fee) => fee.toJSON()),
    });
  } catch (error) {
    res.status(500).json({ message: 'Could not load dashboard summary', error: error.message });
  }
});

/* ----------------------------- Members ----------------------------- */
router.get('/members', async (req, res) => {
  try {
    const { search = '', plan = '', fee = '', trainer = '' } = req.query;
    const { page, limit, skip } = parsePagination(req);
    const where = {};
    if (plan) where.plan = { [Op.like]: `%${plan}%` };
    if (fee) where.fee = fee;
    if (trainer) where.trainer = { [Op.like]: `%${trainer}%` };
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { trainer: { [Op.like]: `%${search}%` } },
      ];
    }

    const total = await Member.count({ where });
    const members = await Member.findAll({
      where,
      attributes: { exclude: ['passwordHash'] },
      order: [['createdAt', 'DESC']],
      offset: skip,
      limit,
    });
    res.json({ items: members, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch members', error: err.message });
  }
});

router.get('/members/:id', async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id, { attributes: { exclude: ['passwordHash'] } });
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json(member);
  } catch (err) {
    res.status(400).json({ message: 'Invalid member id', error: err.message });
  }
});

router.post('/members', async (req, res) => {
  try {
    if (!canWrite(req)) return res.status(403).json({ message: 'Forbidden: only admins can create members' });
    const { name, email, password, plan, trainer, img, fee, att, bmi } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'Name and email are required' });
    if (!isEmail(email)) return res.status(400).json({ message: 'Invalid email address' });
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
    const data = member.toJSON();
    delete data.passwordHash;
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ message: 'Could not create member', error: err.message });
  }
});

router.patch('/members/:id', async (req, res) => {
  try {
    if (!canWrite(req)) return res.status(403).json({ message: 'Forbidden: only admins can update members' });
    const updates = { ...req.body };
    delete updates.passwordHash;
    const [updatedCount] = await Member.update(updates, { where: { id: req.params.id } });
    if (!updatedCount) return res.status(404).json({ message: 'Member not found' });
    const member = await Member.findByPk(req.params.id, { attributes: { exclude: ['passwordHash'] } });
    res.json(member);
  } catch (error) {
    res.status(400).json({ message: 'Could not update member', error: error.message });
  }
});

router.delete('/members/:id', async (req, res) => {
  if (!canWrite(req)) return res.status(403).json({ message: 'Forbidden: only admins can delete members' });
  await Member.destroy({ where: { id: req.params.id } });
  res.status(204).end();
});

/* --------------------------- Attendance --------------------------- */
router.get('/attendance', async (req, res) => {
  try {
    const { search = '', status = '' } = req.query;
    const { page, limit, skip } = parsePagination(req);
    const where = {};
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { memberName: { [Op.like]: `%${search}%` } },
        { notes: { [Op.like]: `%${search}%` } },
      ];
    }
    const total = await Attendance.count({ where });
    const attendance = await Attendance.findAll({ where, order: [['date', 'DESC'], ['createdAt', 'DESC']], offset: skip, limit });
    res.json({ items: attendance, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch attendance', error: err.message });
  }
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
    const [updatedCount] = await Attendance.update(req.body, { where: { id: req.params.id } });
    if (!updatedCount) return res.status(404).json({ message: 'Attendance record not found' });
    const item = await Attendance.findByPk(req.params.id);
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: 'Could not update attendance record', error: error.message });
  }
});

router.delete('/attendance/:id', async (req, res) => {
  if (!canWrite(req)) return res.status(403).json({ message: 'Forbidden: only admins can manage attendance' });
  await Attendance.destroy({ where: { id: req.params.id } });
  res.status(204).end();
});

/* --------------------------- Membership Plans --------------------------- */
router.get('/plans', async (req, res) => {
  try {
    const { search = '', status = '' } = req.query;
    const { page, limit, skip } = parsePagination(req);
    const where = {};
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        literal(`json_extract(features, '$') LIKE '%${search}%'`),
      ];
    }
    const total = await MembershipPlan.count({ where });
    const plans = await MembershipPlan.findAll({ where, order: [['createdAt', 'DESC']], offset: skip, limit });
    res.json({ items: plans, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch plans', error: err.message });
  }
});

router.post('/plans', async (req, res) => {
  try {
    if (!canWrite(req)) return res.status(403).json({ message: 'Forbidden: only admins can manage plans' });
    const { name, durationMonths, price, features } = req.body;
    if (!name || !price) return res.status(400).json({ message: 'Plan name and price are required' });
    const plan = await MembershipPlan.create({ name, durationMonths, price, features });
    res.status(201).json(plan);
  } catch (error) {
    res.status(400).json({ message: 'Could not create plan', error: error.message });
  }
});

router.patch('/plans/:id', async (req, res) => {
  try {
    if (!canWrite(req)) return res.status(403).json({ message: 'Forbidden: only admins can manage plans' });
    const [updatedCount] = await MembershipPlan.update(req.body, { where: { id: req.params.id } });
    if (!updatedCount) return res.status(404).json({ message: 'Plan not found' });
    const plan = await MembershipPlan.findByPk(req.params.id);
    res.json(plan);
  } catch (error) {
    res.status(400).json({ message: 'Could not update plan', error: error.message });
  }
});

router.delete('/plans/:id', async (req, res) => {
  if (!canWrite(req)) return res.status(403).json({ message: 'Forbidden: only admins can manage plans' });
  await MembershipPlan.destroy({ where: { id: req.params.id } });
  res.status(204).end();
});

/* --------------------------- Fee Management --------------------------- */
router.get('/fees', async (req, res) => {
  try {
    const { search = '', status = '' } = req.query;
    const { page, limit, skip } = parsePagination(req);
    const where = {};
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { memberName: { [Op.like]: `%${search}%` } },
        { plan: { [Op.like]: `%${search}%` } },
      ];
    }
    const total = await FeeRecord.count({ where });
    const fees = await FeeRecord.findAll({ where, order: [['dueDate', 'ASC'], ['createdAt', 'DESC']], offset: skip, limit });
    res.json({ items: fees, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch fees', error: err.message });
  }
});

router.get('/pending-fees', async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req);
    const where = { status: { [Op.ne]: 'Paid' } };
    const total = await FeeRecord.count({ where });
    const fees = await FeeRecord.findAll({ where, order: [['dueDate', 'ASC'], ['createdAt', 'DESC']], offset: skip, limit });
    res.json({ items: fees, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch pending fees', error: err.message });
  }
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
    const [updatedCount] = await FeeRecord.update(req.body, { where: { id: req.params.id } });
    if (!updatedCount) return res.status(404).json({ message: 'Fee record not found' });
    const fee = await FeeRecord.findByPk(req.params.id);
    res.json(fee);
  } catch (error) {
    res.status(400).json({ message: 'Could not update fee record', error: error.message });
  }
});

router.delete('/fees/:id', async (req, res) => {
  if (!canWrite(req)) return res.status(403).json({ message: 'Forbidden: only admins can manage fees' });
  await FeeRecord.destroy({ where: { id: req.params.id } });
  res.status(204).end();
});

/* ----------------------------- Trainers ----------------------------- */
router.get('/trainers', async (req, res) => {
  try {
    const { search = '' } = req.query;
    const { page, limit, skip } = parsePagination(req);
    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { spec: { [Op.like]: `%${search}%` } },
      ];
    }
    const total = await Trainer.count({ where });
    const trainers = await Trainer.findAll({ where, order: [['createdAt', 'DESC']], offset: skip, limit });
    res.json({ items: trainers, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch trainers', error: err.message });
  }
});

router.post('/trainers', async (req, res) => {
  try {
    if (!canWrite(req)) return res.status(403).json({ message: 'Forbidden: only admins can manage trainers' });
    const { name, spec, clients, rating, sessions, img } = req.body;
    if (!name) return res.status(400).json({ message: 'Trainer name is required' });
    const trainer = await Trainer.create({ name, spec, clients, rating, sessions, img });
    res.status(201).json(trainer);
  } catch (error) {
    res.status(400).json({ message: 'Could not create trainer', error: error.message });
  }
});

router.patch('/trainers/:id', async (req, res) => {
  try {
    if (!canWrite(req)) return res.status(403).json({ message: 'Forbidden: only admins can manage trainers' });
    const [updatedCount] = await Trainer.update(req.body, { where: { id: req.params.id } });
    if (!updatedCount) return res.status(404).json({ message: 'Trainer not found' });
    const trainer = await Trainer.findByPk(req.params.id);
    res.json(trainer);
  } catch (error) {
    res.status(400).json({ message: 'Could not update trainer', error: error.message });
  }
});

router.delete('/trainers/:id', async (req, res) => {
  if (!canWrite(req)) return res.status(403).json({ message: 'Forbidden: only admins can manage trainers' });
  await Trainer.destroy({ where: { id: req.params.id } });
  res.status(204).end();
});

/* --------------------------- Workout Programs --------------------------- */
router.get('/workouts', async (req, res) => {
  try {
    const { search = '' } = req.query;
    const { page, limit, skip } = parsePagination(req);
    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { category: { [Op.like]: `%${search}%` } },
      ];
    }
    const total = await WorkoutProgram.count({ where });
    const workouts = await WorkoutProgram.findAll({ where, order: [['createdAt', 'DESC']], offset: skip, limit });
    res.json({ items: workouts, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch workouts', error: err.message });
  }
});

router.post('/workouts', async (req, res) => {
  try {
    if (!canWrite(req)) return res.status(403).json({ message: 'Forbidden: only admins can manage workout programs' });
    const { name, category, duration, intensity, trainer, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Workout name is required' });
    const workout = await WorkoutProgram.create({ name, category, duration, intensity, trainer, description });
    res.status(201).json(workout);
  } catch (error) {
    res.status(400).json({ message: 'Could not create workout program', error: error.message });
  }
});

router.patch('/workouts/:id', async (req, res) => {
  try {
    if (!canWrite(req)) return res.status(403).json({ message: 'Forbidden: only admins can manage workout programs' });
    const [updatedCount] = await WorkoutProgram.update(req.body, { where: { id: req.params.id } });
    if (!updatedCount) return res.status(404).json({ message: 'Workout program not found' });
    const workout = await WorkoutProgram.findByPk(req.params.id);
    res.json(workout);
  } catch (error) {
    res.status(400).json({ message: 'Could not update workout program', error: error.message });
  }
});

router.delete('/workouts/:id', async (req, res) => {
  if (!canWrite(req)) return res.status(403).json({ message: 'Forbidden: only admins can manage workout programs' });
  await WorkoutProgram.destroy({ where: { id: req.params.id } });
  res.status(204).end();
});

/* --------------------------- Diet Plans --------------------------- */
router.get('/diets', async (req, res) => {
  try {
    const { search = '' } = req.query;
    const { page, limit, skip } = parsePagination(req);
    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { goal: { [Op.like]: `%${search}%` } },
      ];
    }
    const total = await DietPlan.count({ where });
    const diets = await DietPlan.findAll({ where, order: [['createdAt', 'DESC']], offset: skip, limit });
    res.json({ items: diets, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch diets', error: err.message });
  }
});

router.post('/diets', async (req, res) => {
  try {
    if (!canWrite(req)) return res.status(403).json({ message: 'Forbidden: only admins can manage diet plans' });
    const { name, goal, calories, meals, trainer } = req.body;
    if (!name) return res.status(400).json({ message: 'Diet name is required' });
    const diet = await DietPlan.create({ name, goal, calories, meals, trainer });
    res.status(201).json(diet);
  } catch (error) {
    res.status(400).json({ message: 'Could not create diet plan', error: error.message });
  }
});

router.patch('/diets/:id', async (req, res) => {
  try {
    if (!canWrite(req)) return res.status(403).json({ message: 'Forbidden: only admins can manage diet plans' });
    const [updatedCount] = await DietPlan.update(req.body, { where: { id: req.params.id } });
    if (!updatedCount) return res.status(404).json({ message: 'Diet plan not found' });
    const diet = await DietPlan.findByPk(req.params.id);
    res.json(diet);
  } catch (error) {
    res.status(400).json({ message: 'Could not update diet plan', error: error.message });
  }
});

router.delete('/diets/:id', async (req, res) => {
  if (!canWrite(req)) return res.status(403).json({ message: 'Forbidden: only admins can manage diet plans' });
  await DietPlan.destroy({ where: { id: req.params.id } });
  res.status(204).end();
});

/* --------------------------- Notifications --------------------------- */
router.get('/notifications', async (req, res) => {
  try {
    const notifs = await Notification.findAll({ order: [['createdAt', 'DESC']], limit: 30 });
    res.json(notifs);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch notifications', error: error.message });
  }
});

/* ------------------------- Streaks (from Members) ------------------------- */
router.get('/streaks', async (req, res) => {
  try {
    const members = await Member.findAll({ attributes: ['id', 'name', 'img', 'streak'] });
    const streaks = members
      .map((m) => m.toJSON())
      .filter((m) => m.streak && Number(m.streak.current) > 0)
      .sort((a, b) => Number(b.streak.current || 0) - Number(a.streak.current || 0))
      .map((m) => ({
        id: m.id,
        name: m.name,
        img: m.img,
        current: m.streak.current || 0,
        longest: m.streak.longest || 0,
        last: m.streak.last || '',
        tier: m.streak.tier || 'bronze',
      }));
    res.json(streaks);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch streaks', error: error.message });
  }
});

/* ------------------------------ Rewards ------------------------------ */
router.get('/rewards', async (req, res) => {
  try {
    const rewards = await RewardHistory.findAll({ order: [['createdAt', 'DESC']], limit: 30 });
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch rewards', error: error.message });
  }
});

router.post('/rewards', async (req, res) => {
  try {
    const { memberId, name, img, reward } = req.body;
    const entry = await RewardHistory.create({
      memberId,
      name,
      img,
      reward,
      time: 'Just now',
    });
    if (memberId) {
      const member = await Member.findByPk(memberId);
      if (member) {
        const existing = Array.isArray(member.rewards) ? member.rewards : [];
        member.rewards = [{ name: reward, from: 'Apex Team', time: 'Just now' }, ...existing];
        await member.save();
      }
    }
    res.status(201).json(entry);
  } catch (error) {
    res.status(400).json({ message: 'Could not create reward entry', error: error.message });
  }
});

/* --------------------------- Contact messages --------------------------- */
router.get('/contact-messages', async (req, res) => {
  try {
    const messages = await ContactMessage.findAll({ order: [['createdAt', 'DESC']] });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch contact messages', error: error.message });
  }
});

module.exports = router;
