const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');

const databaseFile = process.env.SQLITE_FILE || path.resolve(__dirname, '../data/apex.sqlite');
const databaseDir = path.dirname(databaseFile);
if (!fs.existsSync(databaseDir)) {
  fs.mkdirSync(databaseDir, { recursive: true });
}

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: databaseFile,
  logging: false,
});

module.exports = sequelize;
