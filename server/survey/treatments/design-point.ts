const { statements, statementproperties } = require("../../models");
const { getStatementsWeighted } = require("../../controllers/statements.js");

import TreatmentInterface from "./treatment.types";

const { Sequelize, QueryTypes } = require("sequelize");
const Op = Sequelize.Op;

const GetRandomStatement = (params: TreatmentInterface) => {
  // Get the design space
  const designSpace = getDesignSpace(params);

  // Get the statements
  const statements = getStatementsWeighted(designSpace);

  // Return the statements
  return statements;
};

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
        attributes: ["parentId", "statement"],
        where: {
          published: true, // Filter for published statements
        },
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

  return filteredStatementIds;
}

export default GetRandomStatement;
