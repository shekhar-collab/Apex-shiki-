const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Trainer = sequelize.define(
  'Trainer',
  {
    name: { type: DataTypes.STRING, allowNull: false },
    spec: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
    img: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
    clients: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    rating: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    sessions: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  { timestamps: true }
);

module.exports = Trainer;
