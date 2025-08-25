module.exports = (sequelize, DataTypes) => {
  const dailyexperiment = sequelize.define(
    "dailyexperiment",
    {
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        primaryKey: true,
      },

      statementIds: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: "Array of 15 statement IDs with lowest ratings for this date",
      },

      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      indexes: [
        {
          fields: ["date"],
        },
      ],
    }
  );

  return dailyexperiment;
};
