const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE,
    process.env.MYSQL_USER,
    process.env.MYSQL_PASSWORD,
    {
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        dialect: 'mysql',
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

const testConnection = async () => {
    console.log(process.env.MYSQL_DATABASE);
    try {
        await sequelize.authenticate();
        console.log('Conexión exitosa con la base de datos');
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
    }
};

testConnection();


module.exports = sequelize;