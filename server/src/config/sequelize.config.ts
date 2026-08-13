import dotenv from 'dotenv';
dotenv.config();

interface DatabaseConfig {
  [key: string]: {
    username?: string;
    password?: string;
    database?: string;
    host?: string;
    port?: string;
    dialect?: string;
    dialectOptions?: object;
    pool?: object;
    url?: string;
  };
}

// Sequelize's `mariadb` dialect targets the mariadb@2.x driver's result
// shape; with the mariadb@3.x driver actually installed, every query throws
// "Cannot delete property 'meta' of [object Array]" (unfixed upstream:
// sequelize/sequelize#16262). Our MariaDB RDS instance is fully compatible
// with the `mysql` dialect (mysql2 driver) over the wire protocol, so always
// use that -- even if DB_DRIVER is misconfigured to "mariadb".
const resolveDialect = () =>
  process.env.DB_DRIVER === 'sqlite' ? 'sqlite' : 'mysql';

const database: DatabaseConfig = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: resolveDialect(),
    dialectOptions: {
      connectTimeout: 10000,
    },
    pool: {
      max: 5,
      min: 0,
      idle: 10000,
    },
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: resolveDialect(),
    dialectOptions: {
      connectTimeout: 10000,
    },
    pool: {
      max: 5,
      min: 0,
      idle: 10000,
    },
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: resolveDialect(),
    dialectOptions: {
      connectTimeout: 10000,
    },
    pool: {
      max: 5,
      min: 0,
      idle: 10000,
    },
  },
};

export default database;
