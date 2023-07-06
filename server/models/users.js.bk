const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define("users", {
    name: {
      type: DataTypes.STRING,
      defaultValue: "Anonymous",
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    magicLink: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false,
      defaultValue: () => uuidv4(),
    },
    magicLinkExpired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
  });

  // Users.associate = (models) => {
  //     Users.belongsTo(models.statements, { foreignKey: 'statementId', as: 'statement' });
  // };

  return Users;
};
