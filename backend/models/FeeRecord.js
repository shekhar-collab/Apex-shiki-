const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const FeeRecord = sequelize.define(
  'FeeRecord',
  {
    memberName: { type: DataTypes.STRING, allowNull: false },
    memberId: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
    plan: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
    amount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Pending' },
    dueDate: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
    paidDate: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
    method: { type: DataTypes.STRING, allowNull: false, defaultValue: 'UPI' },
  },
  { timestamps: true }
);

module.exports = FeeRecord;
