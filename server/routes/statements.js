const express = require("express");
const router = express.Router();
const { statements, statementproperties, answers } = require("../models");

const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];

const { Sequelize, QueryTypes } = require("sequelize");

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

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

function getStatementByWeight(statementsArray) {
  const temp_data = [
    { id: 1, count: 10 },
    { id: 2, count: 1 },
    { id: 3, count: 1 },
  ];

  const max_answers = Math.max(
    ...statementsArray.map((d) => Number(d.statementCount))
  );
  console.log(statementsArray[0]);

  const weighted_list = statementsArray.flatMap((d) =>
    Array(Math.round(max_answers / (d.statementCount + 1))).fill(d.id)
  );

  console.log(weighted_list);
  console.log(
    statementsArray[
      weighted_list[Math.floor(Math.random() * weighted_list.length)] - 1
    ]
  );
}

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

router.get("/test", async (req, res) => {
  try {
    const [results, metadata] = await sequelize.query(`
        WITH weighted_questions AS (
            SELECT
            statements.id,
            statements.statement,
            1.0 / (COUNT(answers.statementId)+1) AS weight
            FROM
            statements
            LEFT JOIN
                answers ON statements.id = answers.statementId 
            GROUP BY
                statements.id
        )
        
        SELECT
          id,
          statement,
          -LOG(RAND()) / weight AS priority
        FROM
          weighted_questions
        ORDER BY priority ASC  
        LIMIT 1;
        `);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/", async (req, res) => {
  // res.send("hello");
  await statements
    .findAll({
      where: {
        id: [6, 149, 2009, 2904, 3621],
      },
      // include: statementproperties,
      // order: Sequelize.literal('rand()')
    })
    .then(shuffle)
    .then((data) => res.json(data));
});

router.get("/byid/:statementId", async (req, res) => {
  const statementList = await statements.findAll({
    where: {
      id: req.params.statementId,
    },
    // include: statementproperties,
  });
  res.json(statementList);
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
