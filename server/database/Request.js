const { DataTypes } = require('sequelize');
const sequelize = require('./database');


const Request = sequelize.define('Request', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  prompt_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  prompt: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  picture: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  answer: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  model: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'user',
      key: 'id'
    }
  }
}, {
  tableName: 'requests'
});



module.exports = Request;