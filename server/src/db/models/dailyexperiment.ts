import { DataTypes, Sequelize } from 'sequelize';

export default function defineDailyExperiment(
  sequelize: Sequelize,
  dataTypes: typeof DataTypes,
) {
  return sequelize.define(
    'dailyexperiment',
    {
      date: {
        type: dataTypes.DATEONLY,
        allowNull: false,
        primaryKey: true,
      },
      statementIds: {
        type: dataTypes.JSON,
        allowNull: false,
        comment: 'Array of 15 statement IDs with lowest ratings for this date',
      },
      createdAt: {
        type: dataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: dataTypes.DATE,
        allowNull: false,
      },
    },
    {
      indexes: [{ fields: ['date'] }],
    },
  );
}
