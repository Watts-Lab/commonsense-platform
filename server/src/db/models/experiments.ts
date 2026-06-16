import { DataTypes, Sequelize } from 'sequelize';

export default function defineExperiments(
  sequelize: Sequelize,
  dataTypes: typeof DataTypes,
) {
  return sequelize.define(
    'experiments',
    {
      userSessionId: {
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
    },
    {
      indexes: [
        { fields: ['experimentType'] },
        { fields: ['experimentId'] },
        { fields: ['userSessionId', 'experimentType'] },
        { fields: ['finished'] },
      ],
    },
  );
}
