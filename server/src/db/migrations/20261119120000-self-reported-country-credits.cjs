'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const experiments = await queryInterface.describeTable('experiments');
    if (!experiments.selfReportCredited) {
      await queryInterface.addColumn('experiments', 'selfReportCredited', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });

      // Existing rows are already covered by the historical bootstrap
      // (npm run bootstrap:country-matrix), so live crediting must skip them.
      await queryInterface.sequelize.query(
        'UPDATE experiments SET selfReportCredited = 1',
      );
    }

    // Crediting looks up a session's demographics on every survey completion.
    const indexes = await queryInterface.showIndex('individuals');
    const sessionIndex = 'individuals_session_id_information_type';
    if (!indexes.some((index) => index.name === sessionIndex)) {
      await queryInterface.addIndex(
        'individuals',
        ['sessionId', 'informationType'],
        { name: sessionIndex },
      );
    }
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      'individuals',
      'individuals_session_id_information_type',
    );
    await queryInterface.removeColumn('experiments', 'selfReportCredited');
  },
};
