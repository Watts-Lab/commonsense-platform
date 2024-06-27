const { Sequelize } = require("sequelize");
const { statements } = require("../../models");
const { stringy } = require("./utils/id-generator");

const GetStatementByLanguage = async (params) => {
  const statementsText = await statements.findAll({
    where: {
      origLanguage: params.language,
    },
    attributes: ["id", "statement"],
    order: Sequelize.literal("rand()"),
  });

  return {
    id: stringy({
      params,
    }),
    // id: `language-${params.language}`,
    description: "GetStatementByLanguage",
    answer: statementsText,
  };
};

module.exports = {
  GetStatementByLanguage,
};
