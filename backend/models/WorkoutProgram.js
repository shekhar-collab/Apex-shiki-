const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const WorkoutProgram = sequelize.define(
  'WorkoutProgram',
  {
    name: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
    duration: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
    intensity: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Medium' },
    description: { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
    trainer: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
  },
  { timestamps: true }
);

module.exports = WorkoutProgram;
