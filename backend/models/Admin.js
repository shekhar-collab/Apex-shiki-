const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'Admin' },
    img: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Admin', AdminSchema);
