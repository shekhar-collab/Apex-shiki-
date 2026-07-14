const mongoose = require('mongoose');

const FeeRecordSchema = new mongoose.Schema(
  {
    memberName: { type: String, required: true },
    memberId: { type: String, default: '' },
    plan: { type: String, default: '' },
    amount: { type: Number, default: 0 },
    status: { type: String, default: 'Pending' },
    dueDate: { type: String, default: '' },
    paidDate: { type: String, default: '' },
    method: { type: String, default: 'UPI' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FeeRecord', FeeRecordSchema);
