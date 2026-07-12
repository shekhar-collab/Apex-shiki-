const bcrypt = require('bcryptjs');

function buildDemoState() {
  const admin = {
    id: 'demo-admin-1',
    name: 'Alex Morgan',
    email: 'admin@apex.com',
    passwordHash: bcrypt.hashSync('Admin@123', 10),
    role: 'Owner / Admin',
    img: 'admin-1',
  };

  const members = [
    {
      id: 'demo-member-1',
      name: 'Ishaan Verma',
      email: 'ishaan.v@mail.com',
      passwordHash: bcrypt.hashSync('Member@123', 10),
      plan: 'Elite',
      trainer: 'Marcus Lee',
      img: 'member-1',
      join: '21 Jun 2024',
      expiry: '21 Jun 2025',
      att: 94,
      bmi: 24.8,
      fee: 'green',
      streak: { current: 28, longest: 42, last: 'Today', tier: 'gold' },
      macros: [
        { label: 'Protein', val: '182g', target: '200g', pct: 91, color: '#e8cd90' },
        { label: 'Carbs', val: '220g', target: '250g', pct: 88, color: '#7aa6d6' },
        { label: 'Fats', val: '68g', target: '80g', pct: 85, color: '#6fcf97' },
      ],
      meals: [
        { time: 'Breakfast', name: 'Protein Oats', desc: 'Oats, whey, berries', cal: 420 },
        { time: 'Lunch', name: 'Chicken Bowl', desc: 'Rice, chicken, greens', cal: 610 },
        { time: 'Dinner', name: 'Salmon Plate', desc: 'Salmon, potatoes, veg', cal: 540 },
      ],
      exercises: [
        { name: 'Squat Press', detail: '3 rounds · 12 reps', done: true },
        { name: 'HIIT Cardio', detail: '20 mins · moderate', done: false },
        { name: 'Core Burn', detail: '3 rounds · 15 reps', done: true },
      ],
      weekPlan: [
        { d: 'Mon', l: 'Upper', done: true },
        { d: 'Tue', l: 'Cardio', done: true },
        { d: 'Wed', l: 'Rest', done: false },
        { d: 'Thu', l: 'Lower', done: true },
        { d: 'Fri', l: 'Mobility', done: true },
        { d: 'Sat', l: 'Core', done: false },
        { d: 'Sun', l: 'Recovery', done: true },
      ],
      bookings: [
        { d: '18', m: 'Jul', name: 'Power Sculpt', time: '06:30 PM' },
      ],
      payments: [
        { date: '01 Jul', desc: 'Membership Fee', amt: '$120', status: 'green' },
      ],
      rewards: [
        { name: 'Consistency Badge', from: 'Apex Team', time: '2h ago' },
      ],
      achievements: [
        { ico: '🏆', name: '30-Day Streak', desc: 'Keep the momentum going', locked: false },
        { ico: '💧', name: 'Hydration Goal', desc: 'Completed 7 days straight', locked: false },
        { ico: '⚡', name: 'Peak Performance', desc: 'Unlock after 5 sessions', locked: true },
      ],
      notifications: [
        { ico: '💪', title: 'New class added', desc: 'Bootcamp starts this Friday', time: '3h ago' },
      ],
      weightData: [74, 73.8, 73.4, 73.2, 72.9, 72.6],
    },
    {
      id: 'demo-member-2',
      name: 'Maya Rao',
      email: 'maya.r@mail.com',
      passwordHash: bcrypt.hashSync('Member@123', 10),
      plan: 'Essential',
      trainer: 'Elena Cruz',
      img: 'member-2',
      join: '09 May 2024',
      expiry: '09 Aug 2025',
      att: 88,
      bmi: 26.1,
      fee: 'gold',
      streak: { current: 14, longest: 21, last: 'Yesterday', tier: 'silver' },
      macros: [],
      meals: [],
      exercises: [],
      weekPlan: [],
      bookings: [],
      payments: [],
      rewards: [],
      achievements: [],
      notifications: [],
      weightData: [69, 68.7, 68.4, 68.2, 68.1],
    },
  ];

  const trainers = [
    { name: 'Marcus Lee', spec: 'Strength & Conditioning', clients: 42, rating: 4.9, sessions: 12, img: 'trainer-1' },
    { name: 'Elena Cruz', spec: 'HIIT & Mobility', clients: 34, rating: 4.8, sessions: 9, img: 'trainer-2' },
  ];

  const transactions = [
    { name: 'Ishaan Verma', amt: '$120', method: 'Card', status: 'green' },
    { name: 'Maya Rao', amt: '$80', method: 'UPI', status: 'gold' },
  ];

  const notifications = [
    { icon: 'notifications', color: '#e8cd90', title: 'New reward unlocked', desc: 'Ishaan earned a consistency badge', time: 'Just now' },
  ];

  const rewards = [
    { name: 'Ishaan Verma', img: 'member-1', reward: 'Consistency Badge', time: 'Just now' },
  ];

  const kpis = [
    { icon: 'members', label: 'Active Members', val: '1.2k', growth: '+12%', up: true, data: [42, 48, 56, 61, 69, 74] },
    { icon: 'revenue', label: 'Revenue', val: '$84k', growth: '+8%', up: true, data: [20, 24, 28, 31, 37, 42] },
    { icon: 'attendance', label: 'Attendance', val: '91%', growth: '+3%', up: true, data: [60, 64, 66, 69, 72, 74] },
  ];

  const contactMessages = [];

  return { admin, members, trainers, transactions, notifications, rewards, kpis, contactMessages };
}

const state = buildDemoState();

function isDemoMode() {
  return process.env.USE_DEMO_DATA === 'true';
}

function getPublicMember(member) {
  if (!member) return null;
  const { passwordHash, ...rest } = member;
  return rest;
}

function getPublicMembers(list) {
  return list.map(getPublicMember);
}

function authenticateAdmin(email, password) {
  if (!email || !password) return null;
  const admin = state.admin.email === email.toLowerCase() ? state.admin : null;
  if (!admin) return null;
  const ok = bcrypt.compareSync(password, admin.passwordHash);
  return ok ? admin : null;
}

function authenticateMember(email, password) {
  if (!email || !password) return null;
  const member = state.members.find((m) => m.email.toLowerCase() === email.toLowerCase());
  if (!member) return null;
  const ok = bcrypt.compareSync(password, member.passwordHash);
  return ok ? member : null;
}

function registerMember({ name, email, password }) {
  const normalizedEmail = (email || '').trim().toLowerCase();
  if (!name || !normalizedEmail || !password) return null;
  if (state.members.some((m) => m.email.toLowerCase() === normalizedEmail)) return null;

  const member = {
    id: `demo-member-${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: bcrypt.hashSync(password, 10),
    plan: 'Essential',
    trainer: '',
    img: '',
    join: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    expiry: '',
    att: 0,
    bmi: 0,
    fee: 'green',
    streak: { current: 0, longest: 0, last: '', tier: 'bronze' },
    macros: [],
    meals: [],
    exercises: [],
    weekPlan: [],
    bookings: [],
    payments: [],
    rewards: [],
    achievements: [],
    notifications: [],
    weightData: [],
  };
  state.members.push(member);
  return member;
}

function getMemberById(id) {
  return state.members.find((member) => member.id === id) || null;
}

function getMemberByEmail(email) {
  return state.members.find((member) => member.email.toLowerCase() === email.toLowerCase()) || null;
}

function updateMember(memberId, updates) {
  const member = getMemberById(memberId);
  if (!member) return null;
  Object.assign(member, updates);
  return member;
}

function addBooking(memberId, booking) {
  const member = getMemberById(memberId);
  if (!member) return null;
  member.bookings = [...(member.bookings || []), booking];
  return member.bookings;
}

function removeBooking(memberId, index) {
  const member = getMemberById(memberId);
  if (!member) return null;
  const list = [...(member.bookings || [])];
  if (index < 0 || index >= list.length) return null;
  list.splice(index, 1);
  member.bookings = list;
  return member.bookings;
}

function toggleExercise(memberId, index) {
  const member = getMemberById(memberId);
  if (!member) return null;
  const list = [...(member.exercises || [])];
  if (index < 0 || index >= list.length) return null;
  list[index] = { ...list[index], done: !list[index].done };
  member.exercises = list;
  return member.exercises;
}

function addReward(memberId, payload) {
  const reward = {
    name: payload.name,
    img: payload.img || '',
    reward: payload.reward,
    time: 'Just now',
  };
  state.rewards.unshift(reward);
  if (memberId) {
    const member = getMemberById(memberId);
    if (member) {
      member.rewards = [{ name: payload.reward, from: 'Apex Team', time: 'Just now' }, ...(member.rewards || [])];
    }
  }
  return reward;
}

function addContactMessage(payload) {
  const entry = {
    id: `msg-${Date.now()}`,
    ...payload,
    createdAt: new Date().toISOString(),
  };
  state.contactMessages.unshift(entry);
  return entry;
}

module.exports = {
  isDemoMode,
  state,
  authenticateAdmin,
  authenticateMember,
  registerMember,
  getMemberById,
  getMemberByEmail,
  getPublicMember,
  getPublicMembers,
  updateMember,
  addBooking,
  removeBooking,
  toggleExercise,
  addReward,
  addContactMessage,
};
