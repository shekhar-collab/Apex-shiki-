const mongoose = require('mongoose');

const TrainerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    spec: { type: String, default: '' },
    img: { type: String, default: '' },
    clients: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    sessions: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Trainer', TrainerSchema);
