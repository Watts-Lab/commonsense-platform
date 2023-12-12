module.exports = (sequelize, DataTypes) => {
  const userStatements = sequelize.define("userstatements", {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    statementText: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    statementProperties: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  });

  userStatements.associate = (models) => {
    userStatements.belongsTo(models.users, {
      foreignKey: "userId",
      as: "user",
    });
  };

  return userStatements;
};
