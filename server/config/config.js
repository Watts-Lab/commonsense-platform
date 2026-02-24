require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DRIVER,
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
    dialect: "sqlite",
    storage: ":memory:",
    logging: false,
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
    dialect: process.env.DB_DRIVER,
    dialectOptions: {
      connectTimeout: 10000,
    },
    pool: {
      max: 5,
      min: 0,
      idle: 10000,
    },
  },
  dboptions: {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DRIVER,
    dialectOptions: {
      connectTimeout: 10000,
    },
    schema: {
      tableName: "sessions",
      columnNames: {
        session_id: "session_id",
        expires: "expires",
        data: "data",
      },
    },
    pool: {
      max: 5,
      min: 0,
      idle: 10000,
    },
  },
};
