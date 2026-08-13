import dotenv from 'dotenv';

dotenv.config({ quiet: true });

export interface DatabaseConfig {
  username?: string;
  password?: string;
  database?: string;
  host?: string;
  port?: string;
  dialect?: 'mysql' | 'mariadb' | 'sqlite';
  storage?: string;
  logging?: boolean;
  dialectOptions?: Record<string, unknown>;
  pool?: {
    max: number;
    min: number;
    idle: number;
  };
}

const sharedPool = {
  max: 5,
  min: 0,
  idle: 10000,
};

// Sequelize's `mariadb` dialect targets the mariadb@2.x driver's result
// shape; with the mariadb@3.x driver actually installed, every query throws
// "Cannot delete property 'meta' of [object Array]" (unfixed upstream:
// sequelize/sequelize#16262). Our MariaDB RDS instance is fully compatible
// with the `mysql` dialect (mysql2 driver) over the wire protocol, so always
// use that -- even if DB_DRIVER is misconfigured to "mariadb".
const resolveDialect = (): 'mysql' | 'sqlite' =>
  process.env.DB_DRIVER === 'sqlite' ? 'sqlite' : 'mysql';

export const database: Record<string, DatabaseConfig> = {
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
    pool: sharedPool,
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
    dialectOptions: {
      connectTimeout: 10000,
    },
    pool: sharedPool,
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
    pool: sharedPool,
  },
};

export const dboptions = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  pool: sharedPool,
};

export const dbSessionSchema = {
  tableName: 'sessions',
  columnNames: {
    session_id: 'session_id',
    expires: 'expires',
    data: 'data',
  },
};
