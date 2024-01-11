const { statements, statementproperties } = require("../../models");
const { getStatementsWeighted } = require("../../controllers/statements.js");
// import { TreatmentWithDesignSpaceInterface } from "./treatment.types";
const { Sequelize, QueryTypes } = require("sequelize");
const Op = Sequelize.Op;

// Assuming this function doesn't use 'this', which arrow functions don't bind
const GetRandomStatement = (params) => {
  const designSpace = getDesignSpace(params);
  const statements = getStatementsWeighted(designSpace);
  return statements;
};

// type StatementData = {
//   statementId: number;
//   behavior: number;
//   everyday: number;
//   figure_of_speech: number;
//   judgment: number;
//   opinion: number;
//   reasoning: number;
//   statement: string;
//   published: number;
// };

const treatmentWithConditions = {
  id: 1,
  name: "Example Treatment",
  description: "This is an example treatment with conditions.",
  published: true,
  randomization: false,
  seed: 42,
  createdAt: new Date(),
  conditions: {
    behavior: true,
    everyday: true,
    figure_of_speech: false,
    judgment: true,
    opinion: false,
    reasoning: true,
  },
};

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

  console.log(statementsPivot[0]);
  const filteredStatementIds = statementsPivot
    .filter((data) => {
      return (
        data.behavior === params.conditions.behavior &&
        data.everyday === params.conditions.everyday &&
        data.figure_of_speech === params.conditions.figure_of_speech &&
        data.judgment === params.conditions.judgment &&
        data.opinion === params.conditions.opinion &&
        data.reasoning === params.conditions.reasoning
      );
    })
    .map((data) => {
      return { id: data.statementId, statement: data.statement };
    });

  return filteredStatementIds;
};

module.exports = {
  getDesignSpace,
  GetRandomStatement,
};
