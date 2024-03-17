const { statements, statementproperties } = require("../../models");
const { seededRandom } = require("./utils/random-shuffle");

const { Sequelize } = require("sequelize");

const DesignPointRandomized = async ({
  randomSeed,
  numberOfStatements,
  desingPointParams,
}) => {
  const designSpace = await getDesignSpace(desingPointParams);

  const { shuffle } = seededRandom({
    seed: String(randomSeed),
  });

  const designId = {
    behavior: desingPointParams.behavior,
    everyday: desingPointParams.everyday,
    figure_of_speech: desingPointParams.figure_of_speech,
    reasoning: desingPointParams.reasoning,
    judgment: desingPointParams.judgment,
    opinion: desingPointParams.opinion,
    category: desingPointParams.category,
  };
  return {
    id: JSON.stringify({
      randomSeed,
      numberOfStatements,
      desingPointParams: designId,
    }),
    description: this.name,
    answer: shuffle(designSpace).slice(0, numberOfStatements),
  };
};

/**
 * Retrieves the design space based on the provided parameters.
 *
 * @param {Object} params - The parameters for filtering the design space.
 * @param {string} params.behavior - The behavior condition.
 * @param {string} params.everyday - The everyday condition.
 * @param {string} params.figure_of_speech - The figure of speech condition.
 * @param {string} params.judgment - The judgment condition.
 * @param {string} params.opinion - The opinion condition.
 * @param {string} params.reasoning - The reasoning condition.
 * @param {string} params.category - The category condition.
 * @returns {Array} - An array of filtered statement IDs and their corresponding statements.
 */
const getDesignSpace = async (params) => {
  // creates a pivot table of statement properties
  const statementsPivot = await statementproperties.findAll({
    attributes: [
      "statementId",
      [
        Sequelize.literal(
          "MAX(CASE WHEN statementproperties.name = 'behavior' THEN statementproperties.available END)"
        ),
        "behavior",
      ],
      [
        Sequelize.literal(
          "MAX(CASE WHEN statementproperties.name = 'everyday' THEN statementproperties.available END)"
        ),
        "everyday",
      ],
      [
        Sequelize.literal(
          "MAX(CASE WHEN statementproperties.name = 'figure_of_speech' THEN statementproperties.available END)"
        ),
        "figure_of_speech",
      ],
      [
        Sequelize.literal(
          "MAX(CASE WHEN statementproperties.name = 'judgment' THEN statementproperties.available END)"
        ),
        "judgment",
      ],
      [
        Sequelize.literal(
          "MAX(CASE WHEN statementproperties.name = 'opinion' THEN statementproperties.available END)"
        ),
        "opinion",
      ],
      [
        Sequelize.literal(
          "MAX(CASE WHEN statementproperties.name = 'reasoning' THEN statementproperties.available END)"
        ),
        "reasoning",
      ],
      [Sequelize.col("statement.statement"), "statement"],
      [Sequelize.col("statement.published"), "published"],
      [Sequelize.col("statement.statementCategory"), "category"],
    ],
    group: ["statementId"],
    raw: true,
    include: [
      {
        model: statements,
        attributes: [],
        where: {
          published: true,
        },
      },
    ],
    logging: console.log,
  }); // filters the pivot table by the params

  const filteredStatementIds = statementsPivot
    .filter((data) => {
      return (
        data.behavior === params.behavior &&
        data.everyday === params.everyday &&
        data.figure_of_speech === params.figure_of_speech &&
        data.judgment === params.judgment &&
        data.opinion === params.opinion &&
        data.reasoning === params.reasoning &&
        data.category === params.category
      );
    })
    .map((data) => {
      return { id: data.statementId, statement: data.statement };
    });

  return filteredStatementIds;
};

module.exports = {
  DesignPointRandomized,
};
