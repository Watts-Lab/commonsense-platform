const { statements, statementproperties, answers } = require("../models");

const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.js")[env];

const { Sequelize, QueryTypes } = require("sequelize");
const Op = Sequelize.Op;

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

const { valid_statementlist } = require("../routes/statement_clear.js");

const getStatementsWeighted = async (
  sessionId,
  validStatementList,
  numberOfStatements = 1
) => {
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

    return results;
  } catch (error) {
    console.error(error);
    throw new Error("An error occurred");
  }
};

const next = async (req, res) => {
  try {
    const sessionId = req.query.sessionId || null;

    const results = await getStatementsWeighted(sessionId, valid_statementlist);

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

const baseStatements = async (req, res) => {
  await statements
    .findAll({
      where: {
        id: [6, 149, 2009, 2904, 3621],
      },
      // include: statementproperties,
      // order: Sequelize.literal('rand()')
    })
    // .then(shuffle)
    .then((data) => res.json(data));
};

const statementById = async (req, res) => {
  await statements
    .findAll({
      where: {
        id: req.params.statementId,
      },
    })
    .then((data) => res.json(data));
};

async function getStatementFromList(statementList) {
  const statementsText = await statements.findAll({
    where: {
      id: statementList,
    },
    attributes: ["id", "statement"],
    order: Sequelize.literal("rand()"),
  });

  return statementsText;
}


module.exports = {
  next,
  baseStatements,
  statementById,
  getStatementsWeighted,
  getStatementFromList,
};
