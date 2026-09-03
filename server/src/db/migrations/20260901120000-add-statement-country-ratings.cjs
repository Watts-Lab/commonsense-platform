'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('statementcountryratings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      // FK is RESTRICT: a rating count must never be orphaned or silently
      // dropped by a statement deletion (mirrors the answers -> statements FK).
      statementId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'statements', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      // ISO 3166-1 numeric country code, zero-padded to 3 digits (e.g. "818"),
      // same convention as countryblocks.countryCode. Only ever populated for
      // the Besample-recruitable country set (see besample-countries.ts).
      countryCode: {
        type: Sequelize.STRING(3),
        allowNull: false,
      },
      // Confirmed rating count for this (statement, country) cell. This is the
      // n(i,j) from the row-priority dynamic-frontier recruitment strategy.
      // Reservations (pending, in-flight sessions) are intentionally NOT
      // persisted here -- they're derived live from unfinished `experiments`
      // rows within the session TTL, mirroring how the legacy country-bundle
      // in-flight count already worked.
      confirmedCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.addIndex(
      'statementcountryratings',
      ['statementId', 'countryCode'],
      { unique: true },
    );
    await queryInterface.addIndex('statementcountryratings', [
      'countryCode',
      'confirmedCount',
    ]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('statementcountryratings');
  },
};
