import { DataTypes, Sequelize } from 'sequelize';

export default function defineStatementProperties(
  sequelize: Sequelize,
  dataTypes: typeof DataTypes,
) {
  return sequelize.define('statementproperties', {
    name: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    available: {
      type: dataTypes.BOOLEAN,
      defaultValue: false,
    },
  });
}
