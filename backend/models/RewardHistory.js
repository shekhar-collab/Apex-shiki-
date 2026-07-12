const mongoose = require('mongoose');

const RewardHistorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    img: { type: String, default: '' },
    reward: { type: String, required: true },
    time: { type: String, default: 'Just now' },
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RewardHistory', RewardHistorySchema);
