const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const RewardHistory = sequelize.define(
  'RewardHistory',
  {
    name: { type: DataTypes.STRING, allowNull: false },
    img: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
    reward: { type: DataTypes.STRING, allowNull: false },
    time: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Just now' },
    memberId: { type: DataTypes.STRING, allowNull: true },
  },
  { timestamps: true }
);

module.exports = RewardHistory;
