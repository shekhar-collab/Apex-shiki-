const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema(
  {
    memberName: { type: String, required: true },
    memberId: { type: String, default: '' },
    date: { type: String, required: true },
    status: { type: String, default: 'Present' },
    notes: { type: String, default: '' },
    checkInTime: { type: String, default: '' },
    checkOutTime: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Attendance', AttendanceSchema);
