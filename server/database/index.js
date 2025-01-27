const sequelize = require("./database");
const createUserModel = require("./user");
const createRequestModel = require("./Request");

const User = createUserModel(sequelize);
const Request = createRequestModel(sequelize);

Request.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Request, { foreignKey: 'user_id' });

(async () => {
    try {
      await sequelize.sync({ 
        alter: true, 
        force: false //! ELIMINAR FORCE EN PRODUCCIÓN
    }); 
      console.log('Modelos sincronizados con éxito.');
    } catch (error) {
      console.error('Error al sincronizar los modelos:', error);
    }
  })();

module.exports = {sequelize, User, Request};