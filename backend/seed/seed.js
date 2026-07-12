require('dotenv').config();
const path = require('path');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const Admin = require('../models/Admin');
const Member = require('../models/Member');
const Trainer = require('../models/Trainer');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const RewardHistory = require('../models/RewardHistory');
const Kpi = require('../models/Kpi');

const adminData = require(path.join(__dirname, 'admin-data.json'));
const memberData = require(path.join(__dirname, 'member-data.json'));

const DEFAULT_PASSWORD = 'Member@123';
const ADMIN_PASSWORD = 'Admin@123';

async function seed() {
  await connectDB();

  console.log('[seed] Clearing existing collections...');
  await Promise.all([
    Admin.deleteMany({}),
    Member.deleteMany({}),
    Trainer.deleteMany({}),
    Transaction.deleteMany({}),
    Notification.deleteMany({}),
    RewardHistory.deleteMany({}),
    Kpi.deleteMany({}),
  ]);

  /* ---------------------------- Admin user ---------------------------- */
  const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await Admin.create({
    name: 'Alex Morgan',
    email: 'admin@apex.com',
    passwordHash: adminPasswordHash,
    role: 'Owner / Admin',
  });
  console.log('[seed] Admin created -> admin@apex.com / ' + ADMIN_PASSWORD);

  /* ------------------------------ Trainers ----------------------------- */
  const trainerDocs = await Trainer.insertMany(adminData.TRAINERS);
  console.log('[seed] Trainers:', trainerDocs.length);

  /* ------------------------------- Members ------------------------------ */
  const streakByName = {};
  for (const s of adminData.STREAKS) streakByName[s.name] = s;

  const memberPasswordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  const memberDocs = [];
  for (const m of adminData.MEMBERS) {
    const streak = streakByName[m.name];
    const emailSlug = m.email.split('@')[0];

    const doc = await Member.create({
      name: m.name,
      email: m.email,
      passwordHash: memberPasswordHash,
      img: m.img,
      plan: m.plan,
      trainer: m.trainer,
      join: m.join,
      expiry: m.expiry,
      att: m.att,
      bmi: m.bmi,
      fee: m.fee,
      streak: streak
        ? { current: streak.current, longest: streak.longest, last: streak.last, tier: streak.tier }
        : { current: 0, longest: 0, last: '', tier: 'bronze' },
      // demo panel content (identical to what the original static member
      // panel displayed) attached to every seeded member account
      macros: memberData.MACROS,
      meals: memberData.MEALS,
      exercises: memberData.EXERCISES,
      weekPlan: memberData.WEEK,
      bookings: memberData.BOOKINGS,
      payments: memberData.PAYMENTS,
      rewards: memberData.MY_REWARDS,
      achievements: memberData.ACHIEVEMENTS,
      notifications: memberData.NOTIFS,
      weightData: memberData.weightData,
    });
    memberDocs.push(doc);
  }
  console.log('[seed] Members:', memberDocs.length, `(login with any member email / ${DEFAULT_PASSWORD})`);

  /* ---------------------------- Transactions ---------------------------- */
  const memberByName = {};
  for (const m of memberDocs) memberByName[m.name] = m;

  const txnDocs = await Transaction.insertMany(
    adminData.TXNS.map((t) => ({
      name: t.name,
      amt: t.amt,
      method: t.method,
      status: t.status,
      member: memberByName[t.name]?._id,
    }))
  );
  console.log('[seed] Transactions:', txnDocs.length);

  /* --------------------------- Notifications --------------------------- */
  const notifDocs = await Notification.insertMany(
    adminData.NOTIFS.map((n) => ({
      icon: n.icon,
      color: n.color,
      title: n.title,
      desc: n.desc,
      time: n.time,
    }))
  );
  console.log('[seed] Notifications:', notifDocs.length);

  /* ----------------------------- Reward log ----------------------------- */
  const rewardDocs = await RewardHistory.insertMany(
    adminData.REWARD_HISTORY.map((r) => ({
      name: r.name,
      img: r.img,
      reward: r.reward,
      time: r.time,
      member: memberByName[r.name]?._id,
    }))
  );
  console.log('[seed] Reward history:', rewardDocs.length);

  /* -------------------------------- KPIs -------------------------------- */
  const kpiDocs = await Kpi.insertMany(
    adminData.KPIS.map((k, i) => ({
      icon: k.icon,
      label: k.label,
      val: k.val,
      growth: k.growth,
      up: k.up,
      data: k.data,
      order: i,
    }))
  );
  console.log('[seed] KPIs:', kpiDocs.length);

  console.log('\n[seed] Done. Demo credentials:');
  console.log('  Admin  -> admin@apex.com / ' + ADMIN_PASSWORD);
  console.log('  Member -> ishaan.v@mail.com / ' + DEFAULT_PASSWORD, '(full panel data — matches the original design demo)');
  console.log('           (any of the other 7 seeded member emails also work, same password)');

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
