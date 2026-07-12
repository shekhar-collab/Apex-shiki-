const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    icon: { type: String, default: 'admission' },
    color: { type: String, default: 'gold' },
    title: { type: String, required: true },
    desc: { type: String, default: '' },
    time: { type: String, default: 'Just now' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
