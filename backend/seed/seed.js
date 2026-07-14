require('dotenv').config();
const path = require('path');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const Admin = require('../models/Admin');
const Member = require('../models/Member');
const Trainer = require('../models/Trainer');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const RewardHistory = require('../models/RewardHistory');
const Kpi = require('../models/Kpi');
const ContactMessage = require('../models/ContactMessage');
const MembershipPlan = require('../models/MembershipPlan');
const FeeRecord = require('../models/FeeRecord');
const WorkoutProgram = require('../models/WorkoutProgram');
const DietPlan = require('../models/DietPlan');

const adminData = require(path.join(__dirname, 'admin-data.json'));
const memberData = require(path.join(__dirname, 'member-data.json'));

const DEFAULT_PASSWORD = 'Member@123';
const ADMIN_PASSWORD = 'Admin@123';

async function seed() {
  await sequelize.authenticate();
  await sequelize.sync({ force: true });

  console.log('[seed] Clearing existing records and recreating schema...');

  const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await Admin.create({
    name: 'Alex Morgan',
    email: 'admin@apex.com',
    passwordHash: adminPasswordHash,
    role: 'Owner / Admin',
  });
  console.log('[seed] Admin created -> admin@apex.com / ' + ADMIN_PASSWORD);

  const trainerDocs = await Promise.all(
    adminData.TRAINERS.map((trainer) => Trainer.create(trainer))
  );
  console.log('[seed] Trainers:', trainerDocs.length);

  const streakByName = {};
  for (const s of adminData.STREAKS) streakByName[s.name] = s;
  const memberPasswordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  const memberDocs = [];
  for (const m of adminData.MEMBERS) {
    const streak = streakByName[m.name] || { current: 0, longest: 0, last: '', tier: 'bronze' };
    const member = await Member.create({
      name: m.name,
      email: m.email.toLowerCase(),
      passwordHash: memberPasswordHash,
      img: m.img,
      plan: m.plan,
      trainer: m.trainer,
      join: m.join,
      expiry: m.expiry,
      att: m.att,
      bmi: m.bmi,
      fee: m.fee,
      streak,
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
    memberDocs.push(member);
  }
  console.log('[seed] Members:', memberDocs.length, `(login with any member email / ${DEFAULT_PASSWORD})`);

  const memberByName = {};
  for (const m of memberDocs) memberByName[m.name] = m;

  const txnDocs = await Promise.all(
    adminData.TXNS.map((t) =>
      Transaction.create({
        name: t.name,
        amt: t.amt,
        method: t.method,
        status: t.status,
        memberId: memberByName[t.name]?.id || null,
      })
    )
  );
  console.log('[seed] Transactions:', txnDocs.length);

  const notifDocs = await Promise.all(
    adminData.NOTIFS.map((n) =>
      Notification.create({ icon: n.icon, color: n.color, title: n.title, desc: n.desc, time: n.time })
    )
  );
  console.log('[seed] Notifications:', notifDocs.length);

  const rewardDocs = await Promise.all(
    adminData.REWARD_HISTORY.map((r) =>
      RewardHistory.create({ name: r.name, img: r.img, reward: r.reward, time: r.time, memberId: memberByName[r.name]?.id || null })
    )
  );
  console.log('[seed] Reward history:', rewardDocs.length);

  const kpiDocs = await Promise.all(
    adminData.KPIS.map((k, i) =>
      Kpi.create({ icon: k.icon, label: k.label, val: k.val, growth: k.growth, up: k.up, data: k.data, order: i })
    )
  );
  console.log('[seed] KPIs:', kpiDocs.length);

  console.log('\n[seed] Done. Demo credentials:');
  console.log('  Admin  -> admin@apex.com / ' + ADMIN_PASSWORD);
  console.log('  Member -> ishaan.v@mail.com / ' + DEFAULT_PASSWORD);
  console.log('           (other seeded member emails also work, same password)');

  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
