const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Transaction = sequelize.define(
  'Transaction',
  {
    name: { type: DataTypes.STRING, allowNull: false },
    amt: { type: DataTypes.STRING, allowNull: false },
    method: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Cash' },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'green' },
    memberId: { type: DataTypes.STRING, allowNull: true },
  },
  { timestamps: true }
);

module.exports = Transaction;
