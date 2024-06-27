const { Sequelize } = require("sequelize");
const { statements_subset } = require("../../models");
const { stringy } = require("./utils/id-generator");

const GetStatementByLanguage = async (params) => {
  const statementsText = await statements_subset.findAll({
    where: {
      origLanguage: params.language,
    },
    attributes: ["id", "statement"],
    order: Sequelize.literal("rand()"),
    limit: 15,
  });

  return {
    id: stringy({
      params,
    }),
    description: "GetStatementByLanguage",
    answer: statementsText,
  };
};

module.exports = {
  GetStatementByLanguage,
};
