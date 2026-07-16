const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Member = sequelize.define(
  'Member',
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
    img: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
    plan: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Essential' },
    trainer: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
    join: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
    expiry: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
    att: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    bmi: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    fee: { type: DataTypes.STRING, allowNull: false, defaultValue: 'green' },
    streak: { type: DataTypes.JSON, allowNull: false, defaultValue: {} },
    macros: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    meals: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    exercises: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    weekPlan: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    bookings: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    payments: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    rewards: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    achievements: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    notifications: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    weightData: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
  },
  { timestamps: true }
);

module.exports = Member;
