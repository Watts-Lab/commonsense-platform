const express = require("express");
const router = express.Router();
const { statements, statementproperties, answers } = require("../models");

const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.js")[env];

const { Sequelize, QueryTypes } = require("sequelize");

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

const { valid_statementlist } = require("./statement_clear.js");



router.get("/next", async (req, res) => {
  try {
    const sessionId = req.query.sessionId || null;

    const [results] = await sequelize.query(
      `
      WITH weighted_questions AS (
        SELECT
          statements.id,
          statements.statement,
          1.0 / (COUNT(answers.statementId)+1) AS weight
        FROM
          statements
        LEFT JOIN
          answers ON statements.id = answers.statementId AND answers.sessionId NOT IN (:sessionId)
        GROUP BY
          statements.id
        HAVING
          statements.id IN (:valid_statementlist)
      )
      SELECT
        id,
        statement,
        -LOG(RAND()) / weight AS priority
      FROM
        weighted_questions
      ORDER BY
        priority ASC  
      LIMIT 1;
    `,
      {
        replacements: { sessionId, valid_statementlist }, // Bind the sessionId value
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/", async (req, res) => {
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
});

router.get("/byid/:statementId", async (req, res) => {
  await statements
    .findAll({
      where: {
        id: req.params.statementId,
      },
    })
    .then((data) => res.json(data));
});

router.get("/next", async (req, res) => {
  const statementList = await statements.findAll({
    where: {
      id: {
        [Sequelize.Op.notIn]: [6, 149, 2009, 2904, 3621],
      },
    },
    attributes: {
      include: [
        [
          Sequelize.fn("COUNT", Sequelize.col("answers.statementId")),
          "statementCount",
        ],
      ],
      exclude: [
        "statementSource",
        "origLanguage",
        "published",
        "createdAt",
        "updatedAt",
      ],
    },
    include: [
      {
        model: answers,
        attributes: [],
      },
    ],
    group: ["statements.id"],
  });
  // res.json(getRandom(statementList,10));
  res.json(getStatementByWeight(statementList));
});

module.exports = router;
