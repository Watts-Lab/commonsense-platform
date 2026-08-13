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

// Sequelize's `mariadb` dialect targets the mariadb@2.x driver's result
// shape; with the mariadb@3.x driver actually installed, every query throws
// "Cannot delete property 'meta' of [object Array]" (unfixed upstream:
// sequelize/sequelize#16262). Our MariaDB RDS instance is fully compatible
// with the `mysql` dialect (mysql2 driver) over the wire protocol, so always
// use that -- even if DB_DRIVER is misconfigured to "mariadb".
const resolveDialect = () =>
  process.env.DB_DRIVER === 'sqlite' ? 'sqlite' : 'mysql';

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: resolveDialect(),
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
    dialect: resolveDialect(),
    ...shared,
  },
};
