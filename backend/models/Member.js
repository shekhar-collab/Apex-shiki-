const mongoose = require('mongoose');

const MacroSchema = new mongoose.Schema(
  { label: String, val: String, target: String, pct: Number, color: String },
  { _id: false }
);

const MealSchema = new mongoose.Schema(
  { time: String, name: String, desc: String, cal: Number },
  { _id: false }
);

const ExerciseSchema = new mongoose.Schema(
  { name: String, detail: String, done: Boolean },
  { _id: false }
);

const WeekDaySchema = new mongoose.Schema(
  { d: String, l: String, done: Boolean },
  { _id: false }
);

const BookingSchema = new mongoose.Schema(
  { d: String, m: String, name: String, time: String },
  { _id: false }
);

const PaymentSchema = new mongoose.Schema(
  { date: String, desc: String, amt: String, status: String },
  { _id: false }
);

const RewardSchema = new mongoose.Schema(
  { name: String, from: String, time: String },
  { _id: false }
);

const AchievementSchema = new mongoose.Schema(
  { ico: String, name: String, desc: String, locked: Boolean },
  { _id: false }
);

const MemberNotifSchema = new mongoose.Schema(
  { ico: String, title: String, desc: String, time: String },
  { _id: false }
);

const StreakSchema = new mongoose.Schema(
  { current: Number, longest: Number, last: String, tier: String },
  { _id: false }
);

const MemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    img: { type: String, default: '' },
    plan: { type: String, default: 'Essential' },
    trainer: { type: String, default: '' },
    join: { type: String, default: '' },
    expiry: { type: String, default: '' },
    att: { type: Number, default: 0 }, // attendance %
    bmi: { type: Number, default: 0 },
    fee: { type: String, enum: ['green', 'red', 'gold'], default: 'green' }, // paid/overdue/partial

    streak: { type: StreakSchema, default: () => ({}) },

    macros: { type: [MacroSchema], default: [] },
    meals: { type: [MealSchema], default: [] },
    exercises: { type: [ExerciseSchema], default: [] },
    weekPlan: { type: [WeekDaySchema], default: [] },
    bookings: { type: [BookingSchema], default: [] },
    payments: { type: [PaymentSchema], default: [] },
    rewards: { type: [RewardSchema], default: [] },
    achievements: { type: [AchievementSchema], default: [] },
    notifications: { type: [MemberNotifSchema], default: [] },
    weightData: { type: [Number], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Member', MemberSchema);
