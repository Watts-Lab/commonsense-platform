/**
 * Retrieves weighted statements based on the provided parameters.
 *
 * @param {string} sessionId - The session ID.
 * @param {Array} validStatementList - The list of valid statement IDs can be empty.
 * @param {number} numberOfStatements - The number of statements to retrieve (default: 1).
 * @returns {Promise<Array>} - A promise that resolves to an array of weighted statements.
 * @throws {Error} - If an error occurs during the retrieval process.
 */
const GetStatementsWeighted = async ({
  sessionId,
  validStatementList,
  numberOfStatements = 1,
}) => {
  try {
    let query = `
        WITH weighted_questions AS (
          SELECT
            statements.id,
            statements.statement,
            1.0 / (COUNT(answers.statementId)+1) AS weight
          FROM
            statements
          LEFT JOIN
            answers ON statements.id = answers.statementId AND answers.sessionId NOT IN (:sessionId)
          WHERE
            statements.published = true
          GROUP BY statements.id
        )
        SELECT
          id,
          statement,
          -LOG(RAND()) / weight AS priority
        FROM
          weighted_questions
        ORDER BY
          priority ASC  
        LIMIT :numberOfStatements;
      `;
    if (validStatementList && validStatementList.length > 0) {
      query = query.replace(
        "GROUP BY statements.id",
        "GROUP BY statements.id HAVING statements.id IN (:validStatementList)"
      );
    }

    const results = await sequelize.query(query, {
      replacements: { sessionId, validStatementList, numberOfStatements }, // Bind the sessionId value
      type: sequelize.QueryTypes.SELECT,
    });

    return {
      id: stringy({
        sessionId,
        validStatementList,
        numberOfStatements,
      }),
      description: "GetStatementById",
      answer: results,
    };
  } catch (error) {
    console.error(error);
    throw new Error("An error occurred");
  }
};

module.exports = {
  GetStatementsWeighted,
};
