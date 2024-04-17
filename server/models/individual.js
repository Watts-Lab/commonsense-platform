module.exports = (sequelize, DataTypes) => {
  const individual = sequelize.define("individual", {
    userSessionId: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    informationType: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    experimentInfo: {
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
  });

  return individual;
};
