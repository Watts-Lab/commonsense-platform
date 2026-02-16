const { sequelize } = require("../../models");
const { stringy } = require("./utils/id-generator");
const { seededShuffle } = require("./utils/seeded-shuffle");

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
  validStatementList = [],
  numberOfStatements = 1,
  language,
}) => {
  try {
    // Define the language column mapping (Object.freeze is used to prevent modification at runtime)
    const languageMap = Object.freeze({
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
    });

    if (language && !languageMap.hasOwnProperty(language)) {
      throw new Error(`Unsupported language code: ${language}`);
    }

    // Select the appropriate column based on the language
    const selectedColumn = languageMap[language] || "statement"; // Default to 'statement' if language is not supported

    // Construct the SQL query with the selected column
    let query = `
     WITH weighted_questions AS (
       SELECT
         statements.id,
         statements.${selectedColumn} AS statement,
         1.0 / (COUNT(answers.statementId) + 1) AS weight
       FROM
         statements
       LEFT JOIN
         answers ON statements.id = answers.statementId AND answers.sessionId NOT IN (:sessionId)
       WHERE
         statements.published = true
       GROUP BY
         statements.id
     )
     SELECT
       id,
       statement,
       -LOG(RAND()) / weight AS priority
     FROM
       weighted_questions
     ORDER BY
       priority ASC
     LIMIT
       :numberOfStatements;
    `;

    const replacements = {
      sessionId,
      numberOfStatements,
    };

    if (validStatementList && validStatementList.length > 0) {
      query = query.replace(
        "GROUP BY\n         statements.id",
        "GROUP BY\n         statements.id HAVING statements.id IN (:validStatementList)"
      );
      replacements.validStatementList = validStatementList;
    }

    // Execute the SQL query
    const results = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    // Apply deterministic shuffle based on sessionId
    // The SQL query already does weighted selection, but the order within
    // that selection should be deterministic per session
    const shuffledResults = sessionId
      ? seededShuffle(results, sessionId)
      : results;

    return {
      id: stringy({
        sessionId,
        validStatementList,
        numberOfStatements,
        language,
      }),
      description: "GetStatementsWeighted",
      answer: shuffledResults.map((result) => ({
        id: result.id,
        statement: result.statement,
      })),
    };
  } catch (error) {
    console.error("Error in GetStatementsWeighted:", error);
    throw new Error("An error occurred while retrieving weighted statements.");
  }
};

module.exports = {
  GetStatementsWeighted,
};
