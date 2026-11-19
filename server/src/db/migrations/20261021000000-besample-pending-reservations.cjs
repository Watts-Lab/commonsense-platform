'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const ratings = await queryInterface.describeTable(
      'statementcountryratings',
    );
    if (!ratings.pendingCount) {
      await queryInterface.addColumn(
        'statementcountryratings',
        'pendingCount',
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
      );
    }

    const experiments = await queryInterface.describeTable('experiments');
    if (!experiments.staleSwept) {
      await queryInterface.addColumn('experiments', 'staleSwept', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });

      // Rows that predate pendingCount hold no reservation, so the sweep must skip them.
      await queryInterface.sequelize.query(
        "UPDATE experiments SET staleSwept = 1 WHERE experimentType = 'besample-sampling'",
      );
    }

    const indexes = await queryInterface.showIndex('experiments');
    const sweepIndex = 'experiments_sweep';
    if (!indexes.some((index) => index.name === sweepIndex)) {
      await queryInterface.addIndex(
        'experiments',
        ['experimentType', 'finished', 'staleSwept', 'createdAt'],
        { name: sweepIndex },
      );
    }
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('experiments', 'experiments_sweep');
    await queryInterface.removeColumn('experiments', 'staleSwept');
    await queryInterface.removeColumn(
      'statementcountryratings',
      'pendingCount',
    );
  },
};
