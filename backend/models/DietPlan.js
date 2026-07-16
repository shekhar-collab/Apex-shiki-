const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const DietPlan = sequelize.define(
  'DietPlan',
  {
    name: { type: DataTypes.STRING, allowNull: false },
    goal: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
    calories: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    meals: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    trainer: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
  },
  { timestamps: true }
);

module.exports = DietPlan;
