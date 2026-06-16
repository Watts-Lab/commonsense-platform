import { DataTypes, Sequelize } from 'sequelize';

export default function defineIndividuals(
  sequelize: Sequelize,
  dataTypes: typeof DataTypes,
) {
  return sequelize.define(
    'individuals',
    {
      userSessionId: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      informationType: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      experimentInfo: {
        type: dataTypes.JSON,
        allowNull: true,
      },
      urlParams: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      finished: {
        type: dataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
    },
    {
      tableName: 'individuals',
    },
  );
}
