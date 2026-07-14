const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Admin = sequelize.define(
  'Admin',
  {
    name: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      set(value) {
        this.setDataValue('email', String(value).toLowerCase());
      },
    },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Admin' },
    img: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
  },
  { timestamps: true }
);

module.exports = Admin;
