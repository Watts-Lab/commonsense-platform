const { statements, statementproperties, answers } = require("../models");
const { getStatementsWeighted } = require("../controllers/statements.js");

const { Sequelize, QueryTypes } = require("sequelize");
const Op = Sequelize.Op;

function getRandom(arr, n) {
  var result = new Array(n),
    len = arr.length,
    taken = new Array(len);
  if (n > len)
    throw new RangeError("getRandom: more elements taken than available");
  while (n--) {
    var x = Math.floor(Math.random() * len);
    result[n] = arr[x in taken ? taken[x] : x];
    taken[x] = --len in taken ? taken[len] : len;
  }
  return result;
}

async function getAllStatements(params) {
  try {
    const statementList = await statements.findAll({
      attributes: ["id", "statement"],
      order: Sequelize.literal("rand()"),
      limit: params.limit,
    });

    // console.log("Statement List:", statementList);
    return statementList;
  } catch (error) {
    // Handle any errors that occur during the database query
    console.error("Error fetching statements:", error);
    throw error;
  }
}

async function getDesignSpace(params) {
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
    ],
    group: ["statementId"],
    raw: true,
    include: [
      {
        model: statements,
        attributes: ["id", "statement"], // Adjust the attributes as per your statement model
      },
    ],
  }); // filters the pivot table by the params

  const filteredStatementIds = statementsPivot
    .filter((data) => {
      return (
        data.behavior === params.space.behavior &&
        data.everyday === params.space.everyday &&
        data.figure_of_speech === params.space.figure_of_speech &&
        data.judgment === params.space.judgment &&
        data.opinion === params.space.opinion &&
        data.reasoning === params.space.reasoning
      );
    })
    .map((data) => {
      return { id: data.statementId, statement: data.statement };
    });

  return getRandom(filteredStatementIds, params.limit);
}

// assignment functions

// round robin assignment
function roundRobinAssignment(assignments) {
  return assignments[Math.floor(Math.random() * assignments.length)];
}

// random assignment
function randomAssignment(assignments) {
  return assignments[Math.floor(Math.random() * assignments.length)];
}

module.exports = {
  treatments: [
    {
      name: "fixed five",
      description: "five statements fixed 10 varies",
      statements: [5, 12, 14, 15], // (list of statements, or callback)
      statements_params: {
        limit: 15,
      },
      randomization: "none", // (none, fully random, callback)
    },
    {
      name: "control",
      description: "control",
      statements: getAllStatements,
      statements_params: {
        limit: 15,
      },
      randomization: "weighted",
    },
    {
      name: "control",
      description: "control",
      statements: getDesignSpace,
      statements_params: {
        space: {
          // design space parameters
          behavior: 1,
          everyday: 0,
          figure_of_speech: 0,
          judgment: 1,
          opinion: 1,
          reasoning: 1,
        },
        limit: 15,
      },
      randomization: "none",
    },
  ],

  // how are people assigned to a treatment?
  assignment: roundRobinAssignment, // (round robin, random, callback)
};
