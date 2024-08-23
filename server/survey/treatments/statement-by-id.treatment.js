const { Sequelize } = require("sequelize");
const { statements } = require("../../models");
const { stringy } = require("./utils/id-generator");

/**
 * Retrieves statements by their IDs.
 *
 * @param {Object} params - The parameters for retrieving statements.
 * @param {Array} params.ids - The IDs of the statements to retrieve.
 * @param {number} [params.limit] - The maximum number of statements to return.
 * @returns {Promise<Array>} - A promise that resolves to an array of statements.
 */
const GetStatementById = async (params, language) => {
  console.log('Language: ', language);
  const languageMap = {
    en: "statement",
    zh: "statement_zh",
    ru: "statement_ru",
    pt: "statement_pt",
    ja: "statement_ja",
    hi: "statement_hi",
    fr: "statement_fr",
    es: "statement_es",
    bn: "statement_bn",
    ar: "statement_ar",
  };

  const selectedColumn = languageMap[language] || "statement"; // default to 'statement' if column is not supported
  console.log("Selected column: ", selectedColumn);

  const statementsText = await statements.findAll({
    where: {
      id: params.ids,
    },
    attributes: ["id", selectedColumn],
    order: Sequelize.literal("rand()"),
  });

  console.log("Statements: ", statementsText);

  return {
    id: stringy({
      params,
    }),
    description: "GetStatementById",
    answer: statementsText,
  };
};

module.exports = {
  GetStatementById,
};
