const { DataTypes } = require('sequelize');
const sequelize = require('./database');


const createUserModel = () => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    phone_number: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    nickname: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    tokens: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('free', 'premium', 'admin'),
      defaultValue: 'free'
    },

    sms: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
  }
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'user'
  });

  return User;
};

module.exports = createUserModel;