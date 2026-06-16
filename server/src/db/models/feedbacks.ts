import { DataTypes, Sequelize } from 'sequelize';

export default function defineFeedbacks(
  sequelize: Sequelize,
  dataTypes: typeof DataTypes,
) {
  return sequelize.define('feedbacks', {
    type: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    comment: {
      type: dataTypes.TEXT,
      allowNull: true,
    },
    sessionId: {
      type: dataTypes.STRING,
      allowNull: true,
    },
    ipAddress: {
      type: dataTypes.STRING,
      allowNull: true,
    },
    userAgent: {
      type: dataTypes.TEXT,
      allowNull: true,
    },
  });
}
