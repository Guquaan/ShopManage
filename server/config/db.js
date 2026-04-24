const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// 如果数据库不存在，首先创建一个
const dbConfig = {
    name: process.env.DB_NAME || 'shopmanage',
    user: process.env.DB_USER || 'root',
    pass: process.env.DB_PASS || '123456',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
}
let sequelize = null
async function initSequelize() {
  // 先用 mysql2 连接创建数据库（如果不存在）
  const connection = await mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.pass,
    port: dbConfig.port
  });
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.name}\`;`);
  await connection.end();

  // 然后创建 Sequelize 实例
  sequelize = new Sequelize(dbConfig.name, dbConfig.user, dbConfig.pass, {
    host: dbConfig.host,
    dialect: 'mysql',
    port: dbConfig.port
  });

  await sequelize.authenticate();
  console.log('Sequelize: 数据库连接成功');
  return sequelize;
}

module.exports = { initSequelize, getSequelize: () => sequelize };