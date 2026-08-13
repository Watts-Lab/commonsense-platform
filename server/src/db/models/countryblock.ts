import { DataTypes, Sequelize } from 'sequelize';

export default function defineCountryBlock(
  sequelize: Sequelize,
  dataTypes: typeof DataTypes,
) {
  return sequelize.define(
    'countryblock',
    {
      // Human-readable country name (e.g. "Egypt", "South Africa"). Stored
      // alongside the code so assignments can record it without a lookup.
      country: {
        type: dataTypes.STRING,
        allowNull: false,
      },

      // ISO 3166-1 numeric country code, zero-padded to 3 digits (e.g. "818").
      // This is what the `tc` URL parameter carries.
      countryCode: {
        type: dataTypes.STRING(3),
        allowNull: false,
      },

      // Block number within the country (1-based).
      block: {
        type: dataTypes.INTEGER,
        allowNull: false,
      },

      // The ordered list of statement ids that make up this block.
      statementIds: {
        type: dataTypes.JSON,
        allowNull: false,
      },

      // Whether this block may still be served. Flip to false to retire a block
      // (e.g. once it has enough completions) without deleting its history.
      enabled: {
        type: dataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      // Running count of how many participants have STARTED this block.
      // Telemetry only (started vs completed); not used for selection. Kept as a
      // maintained counter so nothing has to aggregate the (large) experiments
      // table on the request hot path.
      assignedCount: {
        type: dataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      // Running count of how many participants have COMPLETED this block. This is
      // the selection key: we fill the lowest-numbered block up to the quota
      // (default 10 completions) before moving on to the next block.
      completedCount: {
        type: dataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      indexes: [
        // One row per (country, block); also guards against duplicate imports.
        { unique: true, fields: ['countryCode', 'block'] },
        // Legacy telemetry index (kept to match production): enabled blocks for a
        // country ordered by assignedCount.
        { fields: ['countryCode', 'enabled', 'assignedCount'] },
        // Supports the selection query: enabled blocks for a country, filtered
        // by completedCount (quota) and ordered by block.
        { fields: ['countryCode', 'enabled', 'completedCount', 'block'] },
      ],
    },
  );
}
