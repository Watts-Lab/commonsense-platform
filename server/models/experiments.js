module.exports = (sequelize, DataTypes) => {
  const userTreatments = sequelize.define("experiments", {
    userSessionId: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    experimentId: {
      type: DataTypes.INTEGER,
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
  });

  return userTreatments;
};
