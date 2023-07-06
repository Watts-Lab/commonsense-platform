const fs = require("fs");

// Read the JSON file
const attributesData = fs.readFileSync(
  __dirname + "/attributes/statements.json"
);
const attributes = JSON.parse(attributesData);

const { mapAttributes } = require("./attributes/attributeMapper");

module.exports = (sequelize, DataTypes) => {
  const Statements = sequelize.define("statements", mapAttributes(attributes));

  Statements.associate = (models) => {
    Statements.hasMany(models.statementproperties, {
      onDelete: "cascade",
    });

    Statements.hasMany(models.answers, {
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT",
    });
  };

  return Statements;
};
