module.exports = (sequelize, DataTypes) => {
  const userTreatments = sequelize.define("usertreatments", {
    sessionId: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    treatmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    statementList: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    finished: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    
    urlParams: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  userTreatments.associate = (models) => {
    userTreatments.belongsTo(models.treatments, {
      foreignKey: "treatmentId",
      as: "treatment",
    });
  };

  return userTreatments;
};
