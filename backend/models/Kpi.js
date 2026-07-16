const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Kpi = sequelize.define(
  'Kpi',
  {
    icon: { type: DataTypes.STRING, allowNull: false, defaultValue: 'members' },
    label: { type: DataTypes.STRING, allowNull: false },
    val: { type: DataTypes.STRING, allowNull: false },
    growth: { type: DataTypes.STRING, allowNull: false, defaultValue: '+0%' },
    up: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    data: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  { timestamps: true }
);

module.exports = Kpi;
