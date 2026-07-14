const mongoose = require('mongoose');

const WorkoutProgramSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, default: '' },
    duration: { type: String, default: '' },
    intensity: { type: String, default: 'Medium' },
    description: { type: String, default: '' },
    trainer: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WorkoutProgram', WorkoutProgramSchema);
