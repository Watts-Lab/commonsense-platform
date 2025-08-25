module.exports = (sequelize, DataTypes) => {
  const experiments = sequelize.define(
    "experiments",
    {
      userSessionId: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      experimentId: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      experimentType: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      experimentInfo: {
        type: DataTypes.JSON,
        allowNull: true,
      },

      statementList: {
        type: DataTypes.JSON,
        allowNull: true,
      },

      urlParams: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      finished: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
    },
    {
      indexes: [
        {
          fields: ["experimentType"],
        },
        { fields: ["experimentId"] },
        {
          fields: ["userSessionId", "experimentType"],
        },
        {
          fields: ["finished"],
        },
      ],
    }
  );

  return experiments;
};
