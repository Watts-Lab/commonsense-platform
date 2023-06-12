const answers_schema = require("./attributes/answers");

module.exports = (sequelize, DataTypes) => {

  const Answers = sequelize.define("answers", answers_schema);

  Answers.associate = (models) => {
    Answers.belongsTo(models.statements, {
      foreignKey: "statement_number",
      as: "statement",
    });
  };

  return Answers;
};
