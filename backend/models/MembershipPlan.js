const mongoose = require('mongoose');

const MembershipPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    durationMonths: { type: Number, default: 1 },
    price: { type: Number, default: 0 },
    features: { type: [String], default: [] },
    status: { type: String, default: 'Active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MembershipPlan', MembershipPlanSchema);
