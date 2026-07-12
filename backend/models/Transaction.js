const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    amt: { type: String, required: true },
    method: { type: String, default: 'Cash' },
    status: { type: String, enum: ['green', 'red', 'gold'], default: 'green' },
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', TransactionSchema);
