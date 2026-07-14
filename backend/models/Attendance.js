const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Attendance = sequelize.define(
  'Attendance',
  {
    memberName: { type: DataTypes.STRING, allowNull: false },
    memberId: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
    date: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Present' },
    notes: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
    checkInTime: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
    checkOutTime: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
  },
  { timestamps: true }
);

module.exports = Attendance;
