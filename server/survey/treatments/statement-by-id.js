/**
 * Retrieves statements by their IDs.
 *
 * @param {Object} params - The parameters for retrieving statements.
 * @param {Array} params.ids - The IDs of the statements to retrieve.
 * @param {number} [params.limit] - The maximum number of statements to return.
 * @returns {Promise<Array>} - A promise that resolves to an array of statements.
 */
const GetStatementById = async (params) => {
  const statementsText = await statements.findAll({
    where: {
      id: params.ids,
    },
    attributes: ["id", "statement"],
    order: Sequelize.literal("rand()"),
  });

  if (!params.limit) {
    return statementsText;
  } else {
    return getRandom(statementsText, params.limit);
  }
};

module.exports = {
  GetStatementById,
};
