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

export const database: Record<string, DatabaseConfig> = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect:
      (process.env.DB_DRIVER as 'mysql' | 'mariadb' | 'sqlite') || 'mysql',
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
    dialect:
      (process.env.DB_DRIVER as 'mysql' | 'mariadb' | 'sqlite') || 'mysql',
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
