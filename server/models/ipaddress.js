module.exports = (sequelize, DataTypes) => {
  const ipaddress = sequelize.define(
    "ipaddress",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      sessionId: {
        type: DataTypes.STRING,
        allowNull: false,
        index: true,
      },
      ipAddress: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIP: true,
        },
      },
      userAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      country: {
        type: DataTypes.STRING(2),
        allowNull: true,
      },
      region: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      timezone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      firstSeen: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      lastSeen: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      visitCount: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        allowNull: false,
      },
      isBlocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      tableName: "ipaddresses",
      timestamps: true,
      indexes: [
        {
          fields: ["sessionId"],
        },
        {
          fields: ["ipAddress"],
        },
        {
          fields: ["firstSeen"],
        },
        {
          unique: true,
          fields: ["sessionId", "ipAddress"],
        },
      ],
    }
  );

  return ipaddress;
};
