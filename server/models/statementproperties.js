const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const StatementProperties = sequelize.define("statementproperties", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    available: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  StatementProperties.associate = (models) => {
    StatementProperties.belongsTo(models.statements);
  };

  return StatementProperties;
};

// console.log({

//   name: {
//     type: DataTypes.STRING,
//     allowNull: false
//   },

//   available: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: false
//   }

// })
