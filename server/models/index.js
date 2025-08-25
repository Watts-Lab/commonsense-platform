"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const process = require("process");
require("dotenv").config();
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.js")[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Flag to prevent multiple initializations
let isInitialized = false;

// Database initialization function
const initializeDatabase = async () => {
  if (isInitialized) {
    console.log("🔄 Database already initialized, skipping...");
    return;
  }

  try {
    console.log("🔄 Initializing database...");
    isInitialized = true;

    // Test database connection
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully");

    // Create indexes for better performance
    await createIndexes();

    console.log("🎉 Database initialization completed successfully");
  } catch (error) {
    console.error("💥 Database initialization failed:", error);
    isInitialized = false; // Reset flag on failure
    // Don't throw here - let the application decide how to handle this
  }
};

const createIndexes = async () => {
  try {
    console.log("🔍 Creating database indexes...");

    // Define indexes we want to create
    const indexes = [
      {
        name: "idx_answers_session_created",
        table: "answers",
        columns: "sessionId, createdAt DESC",
      },
      {
        name: "idx_answers_statement_session",
        table: "answers",
        columns: "statementId, sessionId",
      },
      {
        name: "idx_answers_statement_number",
        table: "answers",
        columns: "statement_number",
      },
    ];

    for (const index of indexes) {
      try {
        // Check if index already exists
        const [existingIndexes] = await sequelize.query(`
          SHOW INDEX FROM ${index.table} WHERE Key_name = '${index.name}';
        `);

        if (existingIndexes.length === 0) {
          // Index doesn't exist, create it
          await sequelize.query(`
            CREATE INDEX ${index.name} ON ${index.table}(${index.columns});
          `);
          console.log(`✅ Index '${index.name}' created successfully`);
        } else {
          console.log(`✅ Index '${index.name}' already exists`);
        }
      } catch (error) {
        // Index creation is not critical, so just warn
        console.warn(
          `⚠️  Warning: Could not create index '${index.name}':`,
          error.message
        );
      }
    }
  } catch (error) {
    console.error("❌ Error creating indexes:", error);
    // Don't throw - indexes are performance optimization, not critical
  }
};

// setImmediate to ensure all models are loaded first
setImmediate(() => {
  initializeDatabase();
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
