import { DataTypes, Sequelize } from 'sequelize';

export default function defineIpAddress(
  sequelize: Sequelize,
  dataTypes: typeof DataTypes,
) {
  return sequelize.define(
    'ipaddress',
    {
      id: {
        type: dataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      sessionId: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      ipAddress: {
        type: dataTypes.STRING,
        allowNull: false,
        validate: {
          isIP: true,
        },
      },
      userAgent: {
        type: dataTypes.TEXT,
        allowNull: true,
      },
      country: {
        type: dataTypes.STRING(2),
        allowNull: true,
      },
      region: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      city: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      timezone: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      firstSeen: {
        type: dataTypes.DATE,
        allowNull: false,
        defaultValue: dataTypes.NOW,
      },
      lastSeen: {
        type: dataTypes.DATE,
        allowNull: false,
        defaultValue: dataTypes.NOW,
      },
      visitCount: {
        type: dataTypes.INTEGER,
        defaultValue: 1,
        allowNull: false,
      },
      isBlocked: {
        type: dataTypes.BOOLEAN,
        defaultValue: false,
      },
      metadata: {
        type: dataTypes.JSON,
        allowNull: true,
      },
    },
    {
      tableName: 'ipaddresses',
      timestamps: true,
      indexes: [
        { fields: ['sessionId'] },
        { fields: ['ipAddress'] },
        { fields: ['firstSeen'] },
        { unique: true, fields: ['sessionId', 'ipAddress'] },
      ],
    },
  );
}
