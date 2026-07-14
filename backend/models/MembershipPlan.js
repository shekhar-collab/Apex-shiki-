const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const MembershipPlan = sequelize.define(
  'MembershipPlan',
  {
    name: { type: DataTypes.STRING, allowNull: false },
    durationMonths: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    price: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    features: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Active' },
  },
  { timestamps: true }
);

module.exports = MembershipPlan;
