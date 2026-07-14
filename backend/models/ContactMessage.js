const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const ContactMessage = sequelize.define(
  'ContactMessage',
  {
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'new' },
  },
  { timestamps: true }
);

module.exports = ContactMessage;
