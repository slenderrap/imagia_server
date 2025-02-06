const { DataTypes } = require('sequelize');
const sequelize = require('./database');


const Logs = sequelize.define('Logs', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  log_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  tag: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  username: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  response: {
    type: DataTypes.TEXT,
    allowNull: true
  },
}, {
  tableName: 'logs'
});



module.exports = Logs;