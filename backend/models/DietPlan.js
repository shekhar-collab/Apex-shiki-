const mongoose = require('mongoose');

const DietPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    goal: { type: String, default: '' },
    calories: { type: Number, default: 0 },
    meals: { type: [String], default: [] },
    trainer: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DietPlan', DietPlanSchema);
