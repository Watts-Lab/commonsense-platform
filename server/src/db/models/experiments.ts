import { DataTypes, Sequelize } from 'sequelize';

export default function defineExperiments(
  sequelize: Sequelize,
  dataTypes: typeof DataTypes,
) {
  return sequelize.define(
    'experiments',
    {
      sessionId: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      experimentId: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      experimentType: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      experimentInfo: {
        type: dataTypes.JSON,
        allowNull: true,
      },
      statementList: {
        type: dataTypes.JSON,
        allowNull: true,
      },
      urlParams: {
        type: dataTypes.TEXT,
        allowNull: true,
        validate: {
          len: [0, 1000],
        },
      },
      finished: {
        type: dataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      // True once an abandoned assignment's pendingCount reservation was released.
      staleSwept: {
        type: dataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      // True once this experiment's answers were counted toward the
      // participant's self-reported country in statementcountryratings.
      selfReportCredited: {
        type: dataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      indexes: [
        { fields: ['experimentType'] },
        { fields: ['experimentId'] },
        { fields: ['sessionId', 'experimentType'] },
        { fields: ['finished'] },
        { fields: ['experimentType', 'finished', 'staleSwept', 'createdAt'] },
      ],
    },
  );
}
