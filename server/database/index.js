const sequelize = require("./database");
const User  = require("./user");
const Request = require("./Request");
const Logs = require("./Logs");


Request.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Request, { foreignKey: 'user_id' });

(async () => {
    try {
      await sequelize.sync({ 
        alter: false, 
        force: false //! ELIMINAR FORCE EN PRODUCCIÓN
    }); 
      console.log('Modelos sincronizados con éxito.');
    } catch (error) {
      console.error('Error al sincronizar los modelos:', error);
    }
  })();

module.exports = {sequelize, User, Request};