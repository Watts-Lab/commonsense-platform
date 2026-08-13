require('dotenv').config({ quiet: true });

const shared = {
  dialectOptions: {
    connectTimeout: 10000,
  },
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
  },
};

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DRIVER || 'mysql',
    ...shared,
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
    ...shared,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DRIVER || 'mysql',
    ...shared,
  },
};
