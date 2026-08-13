import { DataTypes, Sequelize } from 'sequelize';

export default function defineUserTreatments(
  sequelize: Sequelize,
  dataTypes: typeof DataTypes,
) {
  return sequelize.define('usertreatments', {
    sessionId: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    treatmentId: {
      type: dataTypes.INTEGER,
      allowNull: false,
    },
    statementList: {
      type: dataTypes.TEXT,
      allowNull: true,
    },
    finished: {
      type: dataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    urlParams: {
      type: dataTypes.STRING,
      allowNull: true,
    },
  });
}
