const { DataTypes } = require('sequelize');
const User = require('./User');

const createRequestsModel = (sequelize) => {
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

  return Request;
};


User.hasMany(Request, { foreignKey: 'user_id' });
Request.belongsTo(User, { foreignKey: 'user_id' });

module.exports = createRequestModel;