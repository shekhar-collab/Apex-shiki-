const mongoose = require('mongoose');

const KpiSchema = new mongoose.Schema(
  {
    icon: { type: String, default: 'members' },
    label: { type: String, required: true },
    val: { type: String, required: true },
    growth: { type: String, default: '+0%' },
    up: { type: Boolean, default: true },
    data: { type: [Number], default: [] },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Kpi', KpiSchema);
