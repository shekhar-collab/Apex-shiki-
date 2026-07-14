const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Notification = sequelize.define(
  'Notification',
  {
    icon: { type: DataTypes.STRING, allowNull: false, defaultValue: 'admission' },
    color: { type: DataTypes.STRING, allowNull: false, defaultValue: 'gold' },
    title: { type: DataTypes.STRING, allowNull: false },
    desc: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
    time: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Just now' },
  },
  { timestamps: true }
);

module.exports = Notification;
