'use strict';

/**
 * Reconcile the legacy production schema (built by the pre-migration
 * `sequelize.sync()`) with the schema our migrations/models now expect.
 *
 * This migration is intentionally IDEMPOTENT and self-inspecting: every change
 * is guarded by an information_schema check, so it is safe to run against:
 *   - production (which has the drifted legacy schema), and
 *   - a fresh DB already built from the (updated) base migration, where every
 *     change below is already in place and therefore skipped.
 *
 * It only ever runs on MySQL/MariaDB (tests use SQLite via sequelize.sync()).
 *
 * Changes:
 *   1. feedbacks: add sessionId / ipAddress / userAgent (missing in prod, the
 *      controller writes them -> prod would throw without this).
 *   2. answers: both FKs to statements become ON DELETE RESTRICT so survey
 *      answers can never be deleted or orphaned when a statement is removed.
 *   3. statementproperties: FK to statements becomes ON DELETE CASCADE.
 *   4. ipaddresses.lastSessionId: fix the literal-string DEFAULT 'NULL' to a
 *      real NULL default.
 *   5. users: name defaults to 'Anonymous'; sessionId is UNIQUE.
 *   6. countryblocks: add the legacy (countryCode, enabled, assignedCount)
 *      index if missing.
 */

module.exports = {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize;

    const query = async (sql, replacements = []) => {
      const [rows] = await sequelize.query(sql, { replacements });
      return rows;
    };

    const columnExists = async (table, column) => {
      const rows = await query(
        `SELECT 1 FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?
         LIMIT 1`,
        [table, column],
      );
      return rows.length > 0;
    };

    const indexExists = async (table, indexName) => {
      const rows = await query(
        `SELECT 1 FROM information_schema.STATISTICS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?
         LIMIT 1`,
        [table, indexName],
      );
      return rows.length > 0;
    };

    // Returns [{ name, deleteRule }] for every FK on table.column -> statements.
    const foreignKeysOn = async (table, column) => {
      return query(
        `SELECT k.CONSTRAINT_NAME AS name, r.DELETE_RULE AS deleteRule
         FROM information_schema.KEY_COLUMN_USAGE k
         JOIN information_schema.REFERENTIAL_CONSTRAINTS r
           ON r.CONSTRAINT_SCHEMA = k.CONSTRAINT_SCHEMA
          AND r.CONSTRAINT_NAME = k.CONSTRAINT_NAME
         WHERE k.TABLE_SCHEMA = DATABASE()
           AND k.TABLE_NAME = ?
           AND k.COLUMN_NAME = ?
           AND k.REFERENCED_TABLE_NAME IS NOT NULL`,
        [table, column],
      );
    };

    // --- 1. feedbacks: add missing columns -----------------------------------
    if (!(await columnExists('feedbacks', 'sessionId'))) {
      await query(
        `ALTER TABLE \`feedbacks\` ADD COLUMN \`sessionId\` VARCHAR(255) NULL`,
      );
    }
    if (!(await columnExists('feedbacks', 'ipAddress'))) {
      await query(
        `ALTER TABLE \`feedbacks\` ADD COLUMN \`ipAddress\` VARCHAR(255) NULL`,
      );
    }
    if (!(await columnExists('feedbacks', 'userAgent'))) {
      await query(
        `ALTER TABLE \`feedbacks\` ADD COLUMN \`userAgent\` TEXT NULL`,
      );
    }

    // --- 2. answers: consolidate statement_number -> statementId -------------
    // Historically both columns were written with the same value. Keep
    // statementId (the load-bearing, consistently-named one) and drop the
    // legacy statement_number duplicate. statementId's FK becomes RESTRICT so
    // answers can never be deleted or orphaned when a statement is removed.
    if (await columnExists('answers', 'statement_number')) {
      // Backfill any rows where statementId is missing but statement_number is
      // present, so no linkage is lost when we drop the column.
      await query(
        `UPDATE \`answers\`
         SET \`statementId\` = \`statement_number\`
         WHERE \`statementId\` IS NULL AND \`statement_number\` IS NOT NULL`,
      );
      // Drop statement_number's FK (if any) and its index before the column.
      for (const fk of await foreignKeysOn('answers', 'statement_number')) {
        await query(
          `ALTER TABLE \`answers\` DROP FOREIGN KEY \`${fk.name}\``,
        );
      }
      if (await indexExists('answers', 'statement_number')) {
        await query(`ALTER TABLE \`answers\` DROP INDEX \`statement_number\``);
      }
      await query(`ALTER TABLE \`answers\` DROP COLUMN \`statement_number\``);
    }
    // statementId -> statements(id): ensure the FK exists and is RESTRICT.
    for (const fk of await foreignKeysOn('answers', 'statementId')) {
      if (fk.deleteRule !== 'RESTRICT' && fk.deleteRule !== 'NO ACTION') {
        await query(`ALTER TABLE \`answers\` DROP FOREIGN KEY \`${fk.name}\``);
      }
    }
    if ((await foreignKeysOn('answers', 'statementId')).length === 0) {
      await query(
        `ALTER TABLE \`answers\`
         ADD CONSTRAINT \`answers_statement_id_fk\`
         FOREIGN KEY (\`statementId\`) REFERENCES \`statements\` (\`id\`)
         ON DELETE RESTRICT ON UPDATE CASCADE`,
      );
    }

    // --- 3. statementproperties: FK becomes CASCADE --------------------------
    for (const fk of await foreignKeysOn('statementproperties', 'statementId')) {
      if (fk.deleteRule !== 'CASCADE') {
        await query(
          `ALTER TABLE \`statementproperties\` DROP FOREIGN KEY \`${fk.name}\``,
        );
      }
    }
    if (
      (await foreignKeysOn('statementproperties', 'statementId')).length === 0
    ) {
      await query(
        `ALTER TABLE \`statementproperties\`
         ADD CONSTRAINT \`statementproperties_statement_id_fk\`
         FOREIGN KEY (\`statementId\`) REFERENCES \`statements\` (\`id\`)
         ON DELETE CASCADE ON UPDATE CASCADE`,
      );
    }

    // --- 4. ipaddresses.lastSessionId: real NULL default --------------------
    if (await columnExists('ipaddresses', 'lastSessionId')) {
      await query(
        `ALTER TABLE \`ipaddresses\`
         MODIFY \`lastSessionId\` VARCHAR(255) NULL DEFAULT NULL`,
      );
    } else {
      await query(
        `ALTER TABLE \`ipaddresses\`
         ADD COLUMN \`lastSessionId\` VARCHAR(255) NULL DEFAULT NULL`,
      );
    }

    // --- 5. users: name default + unique sessionId --------------------------
    await query(
      `ALTER TABLE \`users\` MODIFY \`name\` VARCHAR(255) NULL DEFAULT 'Anonymous'`,
    );
    if (!(await indexExists('users', 'sessionId'))) {
      // Multiple NULL sessionIds are allowed under a UNIQUE index in MySQL.
      await query(
        `ALTER TABLE \`users\` ADD UNIQUE KEY \`sessionId\` (\`sessionId\`)`,
      );
    }

    // --- 6. countryblocks: legacy telemetry index ---------------------------
    const cbIndex = 'countryblocks_country_code_enabled_assigned_count';
    if (
      (await columnExists('countryblocks', 'assignedCount')) &&
      !(await indexExists('countryblocks', cbIndex))
    ) {
      await query(
        `ALTER TABLE \`countryblocks\`
         ADD INDEX \`${cbIndex}\` (\`countryCode\`, \`enabled\`, \`assignedCount\`)`,
      );
    }

    // --- 7. rename userSessionId -> sessionId on experiments & individuals ---
    // Unify the session-id column name across all tables (the majority already
    // use `sessionId`). The stored value is unchanged.
    if (
      (await columnExists('experiments', 'userSessionId')) &&
      !(await columnExists('experiments', 'sessionId'))
    ) {
      // Drop the old composite index before renaming its column, then recreate
      // it under the new name.
      if (
        await indexExists(
          'experiments',
          'experiments_user_session_id_experiment_type',
        )
      ) {
        await query(
          `ALTER TABLE \`experiments\` DROP INDEX \`experiments_user_session_id_experiment_type\``,
        );
      }
      await query(
        `ALTER TABLE \`experiments\` CHANGE \`userSessionId\` \`sessionId\` VARCHAR(255) NOT NULL`,
      );
      if (
        !(await indexExists(
          'experiments',
          'experiments_session_id_experiment_type',
        ))
      ) {
        await query(
          `ALTER TABLE \`experiments\`
           ADD INDEX \`experiments_session_id_experiment_type\` (\`sessionId\`, \`experimentType\`)`,
        );
      }
    }
    if (
      (await columnExists('individuals', 'userSessionId')) &&
      !(await columnExists('individuals', 'sessionId'))
    ) {
      await query(
        `ALTER TABLE \`individuals\` CHANGE \`userSessionId\` \`sessionId\` VARCHAR(255) NOT NULL`,
      );
    }

    // --- 8. update_statement_median stored procedure ------------------------
    // The legacy prod procedure grouped/joined on answers.statement_number,
    // which no longer exists. Recreate it against statementId. (Procedures live
    // only in prod, not in the migrations, so this keeps it working there; it's
    // a no-op-safe DROP + CREATE.)
    await query(`DROP PROCEDURE IF EXISTS \`update_statement_median\``);
    await query(
      `CREATE PROCEDURE \`update_statement_median\`()
       BEGIN
         UPDATE statements s
         JOIN (
           SELECT
             statementId,
             CASE
               WHEN SUM(CASE WHEN I_agree THEN 1 ELSE 0 END) * 2 >= COUNT(*) THEN 1
               ELSE 0
             END AS computed_median
           FROM answers
           GROUP BY statementId
         ) AS c ON s.id = c.statementId
         SET s.statementMedian = c.computed_median
         WHERE s.id = c.statementId;
       END`,
    );
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize;
    const query = async (sql, replacements = []) => {
      const [rows] = await sequelize.query(sql, { replacements });
      return rows;
    };
    const indexExists = async (table, indexName) => {
      const rows = await query(
        `SELECT 1 FROM information_schema.STATISTICS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?
         LIMIT 1`,
        [table, indexName],
      );
      return rows.length > 0;
    };
    const columnExists = async (table, column) => {
      const rows = await query(
        `SELECT 1 FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?
         LIMIT 1`,
        [table, column],
      );
      return rows.length > 0;
    };

    // Reverse the additive/safe changes only. We deliberately do NOT restore
    // the old SET NULL behaviour on answers or the dropped statement_number
    // column, since that would reintroduce the data-integrity hazard and the
    // duplication this migration exists to fix.

    // Reverse the sessionId rename (experiments & individuals).
    if (
      (await columnExists('experiments', 'sessionId')) &&
      !(await columnExists('experiments', 'userSessionId'))
    ) {
      if (
        await indexExists('experiments', 'experiments_session_id_experiment_type')
      ) {
        await query(
          `ALTER TABLE \`experiments\` DROP INDEX \`experiments_session_id_experiment_type\``,
        );
      }
      await query(
        `ALTER TABLE \`experiments\` CHANGE \`sessionId\` \`userSessionId\` VARCHAR(255) NOT NULL`,
      );
      if (
        !(await indexExists(
          'experiments',
          'experiments_user_session_id_experiment_type',
        ))
      ) {
        await query(
          `ALTER TABLE \`experiments\`
           ADD INDEX \`experiments_user_session_id_experiment_type\` (\`userSessionId\`, \`experimentType\`)`,
        );
      }
    }
    if (
      (await columnExists('individuals', 'sessionId')) &&
      !(await columnExists('individuals', 'userSessionId'))
    ) {
      await query(
        `ALTER TABLE \`individuals\` CHANGE \`sessionId\` \`userSessionId\` VARCHAR(255) NOT NULL`,
      );
    }

    if (await indexExists('countryblocks', 'countryblocks_country_code_enabled_assigned_count')) {
      await query(
        `ALTER TABLE \`countryblocks\` DROP INDEX \`countryblocks_country_code_enabled_assigned_count\``,
      );
    }
    for (const col of ['userAgent', 'ipAddress', 'sessionId']) {
      if (await columnExists('feedbacks', col)) {
        await query(`ALTER TABLE \`feedbacks\` DROP COLUMN \`${col}\``);
      }
    }
  },
};
