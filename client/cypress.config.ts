import { defineConfig } from "cypress";
import mysql from "mysql2/promise";

// Reads DB connection settings from the same env vars the CI workflow exports
// (see .github/workflows/test-e2e.yml). Falls back to the local dev defaults.
function dbConfig() {
  return {
    host: process.env.MYSQL_HOST || process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.MYSQL_PORT || process.env.DB_PORT || 33306),
    user: process.env.MYSQL_USER || process.env.DB_USER || "root",
    password: process.env.MYSQL_PWD || process.env.DB_PASSWORD || "password",
    database: process.env.MYSQL_DB || process.env.DB_NAME || "CommonsenseDB",
  };
}

export default defineConfig({
  projectId: "c4ai87",
  e2e: {
    setupNodeEvents(on, config) {
      on("task", {
        // Run a parameterised query and return the rows. Used by e2e tests to
        // assert that data was persisted correctly across tables.
        async queryDb({ sql, params }: { sql: string; params?: unknown[] }) {
          const connection = await mysql.createConnection(dbConfig());
          try {
            const [rows] = await connection.query(sql, params || []);
            return rows;
          } finally {
            await connection.end();
          }
        },
      });

      return config;
    },
  },
});
