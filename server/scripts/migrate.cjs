/*
 * Deploy-time database migration runner.
 *
 * Runs on container startup (see Dockerfile CMD). It is safe to run on every
 * deploy and handles three situations automatically:
 *
 *   1. Legacy production DB (built by the old sequelize.sync(), so it has all
 *      the core tables but NO SequelizeMeta table). We must NOT re-run the base
 *      "create-core-tables" migration against it, so we baseline: create
 *      SequelizeMeta and record the base migration as already applied. Then only
 *      the reconcile migration (and anything newer) runs.
 *
 *   2. A brand-new/empty DB. No core tables and no SequelizeMeta -> run every
 *      migration from scratch.
 *
 *   3. An already-migrated DB. SequelizeMeta exists -> just apply whatever is
 *      pending (usually nothing).
 *
 * After baselining (if needed) it shells out to sequelize-cli db:migrate, which
 * is the same command used locally, so behaviour is identical everywhere.
 */

const { execFileSync } = require('child_process');
const path = require('path');
const mysql = require('mysql2/promise');

const BASE_MIGRATION = '20260522163628-create-core-tables.cjs';

// A table that only the legacy sync()-built schema would already have. If this
// exists but SequelizeMeta doesn't, we're looking at a pre-migration prod DB.
const LEGACY_MARKER_TABLE = 'statements';

async function main() {
  const {
    DB_HOST,
    DB_PORT = '3306',
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
  } = process.env;

  if (!DB_HOST || !DB_USER || !DB_NAME) {
    console.error(
      '[migrate] Missing DB_HOST/DB_USER/DB_NAME; skipping migrations.',
    );
    // Don't hard-fail the container on a misconfigured env in case migrations
    // are intentionally disabled for a given environment.
    return;
  }

  const connection = await mysql.createConnection({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  });

  try {
    const hasTable = async (name) => {
      const [rows] = await connection.query(
        `SELECT 1 FROM information_schema.tables
         WHERE table_schema = ? AND table_name = ? LIMIT 1`,
        [DB_NAME, name],
      );
      return rows.length > 0;
    };

    const hasSequelizeMeta = await hasTable('SequelizeMeta');
    const hasLegacySchema = await hasTable(LEGACY_MARKER_TABLE);

    if (!hasSequelizeMeta && hasLegacySchema) {
      console.log(
        '[migrate] Legacy schema detected without SequelizeMeta; baselining ' +
          `base migration "${BASE_MIGRATION}" as already applied.`,
      );
      await connection.query(
        'CREATE TABLE IF NOT EXISTS `SequelizeMeta` ' +
          '(`name` VARCHAR(255) NOT NULL, PRIMARY KEY (`name`)) ENGINE=InnoDB;',
      );
      await connection.query(
        'INSERT IGNORE INTO `SequelizeMeta` (`name`) VALUES (?);',
        [BASE_MIGRATION],
      );
    }
  } finally {
    await connection.end();
  }

  console.log('[migrate] Running sequelize-cli db:migrate...');
  execFileSync(
    path.resolve(__dirname, '..', 'node_modules', '.bin', 'sequelize-cli'),
    ['db:migrate'],
    { stdio: 'inherit', cwd: path.resolve(__dirname, '..') },
  );
  console.log('[migrate] Migrations complete.');
}

main().catch((err) => {
  console.error('[migrate] Migration failed:', err.message || err);
  process.exit(1);
});
