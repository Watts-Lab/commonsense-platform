import { DataTypes, Sequelize } from 'sequelize';

export default function defineUserStatements(
  sequelize: Sequelize,
  dataTypes: typeof DataTypes,
) {
  return sequelize.define('userstatements', {
    userId: {
      type: dataTypes.INTEGER,
      allowNull: false,
    },
    statementText: {
      type: dataTypes.TEXT,
      allowNull: false,
    },
    statementProperties: {
      type: dataTypes.JSON,
      allowNull: false,
    },
  });
}
