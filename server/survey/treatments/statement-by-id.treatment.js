const { Sequelize } = require("sequelize");
const { statements } = require("../../models");
const { stringy } = require("./utils/id-generator");

/**
 * Retrieves statements by their IDs.
 *
 * @param {Object} params - The parameters for retrieving statements.
 * @param {Array<number>} params.ids - The IDs of the statements to retrieve.
 * @param {string} [params.language] - The language code of the statements to retrieve.
 * @param {number} [params.limit] - The maximum number of statements to return.
 * @returns {Promise<{ id: string, description: string, answer: Array<{ id: number, statement: string }> }>}
 * - A promise that resolves to an object containing the statements.
 */
const GetStatementById = async ({ ids, language, limit }) => {
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

  if (!ids) {
    throw new Error("Missing required parameter: ids");
  }

  const selectedColumn = language ? languageMap[language] : "statement"; // Default to 'statement' if language is not supported

  const statementsText = await statements.findAll({
    where: {
      id: ids,
    },
    attributes: ["id", [selectedColumn, "statement"]], // Alias the selected column to 'statement'
    order: Sequelize.literal("rand()"),
  });

  return {
    id: stringy({
      ids,
    }),
    description: "GetStatementById",
    answer: statementsText,
  };
};

module.exports = {
  GetStatementById,
};
