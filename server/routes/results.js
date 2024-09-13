const express = require("express");
const router = express.Router();
const { answers, statements } = require("../models");

const { body, query, validationResult } = require("express-validator");

const { Sequelize, literal } = require("sequelize");

router.get("/", (req, res) => {
  res.status(200).json({ message: "Result route" });
});

router.post(
  "/",
  [body("sessionId").notEmpty().withMessage("sessionId is required")],
  async (req, res) => {
    // Check for validation errors
    // console.log("req.body", req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    await answers
      .findAll({
        where: {
          sessionId: req.body.sessionId,
        },
        include: [
          {
            model: statements,
            as: "statement",
          },
        ],
        attributes: [
          "statementId",
          "I_agree",
          "perceived_commonsense",
          [Sequelize.col("statement.statementMedian"), "statementMedian"],
        ],
        raw: true,
      })
      .then((results) =>
        // Process the query results
        results
          .map((row) => ({
            awareness: Number(
              row.perceived_commonsense === row.statementMedian
            ),
            consensus: Number(row.I_agree === row.statementMedian),
          }))
          .reduce(
            (avg, value, index, array) => ({
              awareness: avg.awareness + value.awareness / array.length,
              consensus: avg.consensus + value.consensus / array.length,
            }),
            {
              awareness: 0,
              consensus: 0,
            }
          )
      )
      .then((data) => ({
        ...data,
        commonsensicality: Math.sqrt(data.awareness * data.consensus),
      }))
      .then((data) => res.json(data))
      .catch((error) => {
        // Handle any errors that occur during the query
        console.error("Error executing the query:", error);
      });
  }
);

router.get("/all", async (req, res) => {
  console.log("req.sessionID", req.query.sessionId);
  await answers
    .findAll({
      include: [
        {
          model: statements,
          as: "statement",
          attributes: [],
        },
      ],
      attributes: [
        "sessionId",
        "statementId",
        "I_agree",
        "perceived_commonsense",
        [Sequelize.col("statement.statementMedian"), "statementMedian"],
      ],
      raw: true,
    })
    .then((results) => {
      const groupedResults = {};
      results.forEach((result) => {
        const sessionId = result.sessionId;
        if (!groupedResults[sessionId]) {
          groupedResults[sessionId] = [];
        }
        groupedResults[sessionId].push(result);
      });
      return groupedResults;
    })
    .then((results) => {
      // Process the query results
      const output = {};
      for (const sessionId in results) {
        if (results[sessionId].length < 5) continue;
        const sessionData = results[sessionId];
        const sessionResult = sessionData.reduce(
          (avg, value, index, array) => ({
            awareness:
              avg.awareness +
              Number(value.perceived_commonsense === value.statementMedian) /
                array.length,
            consensus:
              avg.consensus +
              Number(value.I_agree === value.statementMedian) / array.length,
          }),
          { awareness: 0, consensus: 0 }
        );

        output[sessionId] = sessionResult;
      }

      return output;
    })
    .then(
      (data) => {
        const output = [];
        Object.keys(data).forEach(function (key, index) {
          data[key]["commonsensicality"] = Math.sqrt(
            data[key]["awareness"] * data[key]["consensus"]
          );

          const commonsensicality = Math.sqrt(
            data[key]["awareness"] * data[key]["consensus"]
          );
          if (key === req.query.sessionId) {
            output.push({
              sessionId: "You",
              commonsensicality,
            });
          } else {
            output.push({
              sessionId: "user" + index,
              commonsensicality,
            });
          }
        });
        return output;
      }
      // data.map((row) => ({
      //   ...row,
      //   commonsensicality: Math.sqrt(row.awareness * row.consensus),
      // }))
    )
    .then((data) => res.json(data))
    .catch((error) => {
      // Handle any errors that occur during the query
      console.error("Error executing the query:", error);
    });
});

// Helper function to calculate agreement percentages
const calculateAgreementPercentage = async (statementIds) => {
  const result = {};
  const answersForStatementAll = await answers.findAll({
    include: [
      {
        model: statements,
        as: "statement",
        attributes: [],
      },
    ],
    attributes: [
      "sessionId",
      "createdAt",
      "statementId",
      "I_agree",
      "others_agree",
    ],
    raw: true,
    where: {
      statementId: statementIds,
    },
  });

  for (const statementId of statementIds) {
    if (answersForStatementAll.length === 0) {
      result[statementId] = { I_agree: 0, others_agree: 0 };
      continue;
    }
    //first filter to get all answers for current statementId
    const answersForOneStatement = answersForStatementAll.filter(
      (answer) => answer.statementId === statementId
    );

    //second filter to get latest answer from each user/sessionId
    const answersForStatement = answersForOneStatement.filter((item) => {
      i = 0;
      while (i < answersForOneStatement.length) {
        if (item.sessionId == answersForOneStatement[i].sessionId) {
          if (
            new Date(item.createdAt).getTime() <
            new Date(answersForOneStatement[i].createdAt).getTime()
          ) {
            return false;
          }
        }
        i++;
      }
      return true;
    });

    const totalAnswers = answersForStatement.length;
    //hardcoded values for if the user is the only one that has answered this statement
    if (totalAnswers == 1) {
      if (
        answersForStatement[0].I_agree == 1 &&
        answersForStatement[0].others_agree == 1
      ) {
        result[statementId] = {
          I_agree: 100,
          others_agree: 100,
        };
      }
      if (
        answersForStatement[0].I_agree == 0 &&
        answersForStatement[0].others_agree == 1
      ) {
        result[statementId] = {
          I_agree: 0,
          others_agree: 0,
        };
      }
      if (
        answersForStatement[0].I_agree == 1 &&
        answersForStatement[0].others_agree == 0
      ) {
        result[statementId] = {
          I_agree: 100,
          others_agree: 100,
        };
      }
      if (
        answersForStatement[0].I_agree == 0 &&
        answersForStatement[0].others_agree == 0
      ) {
        result[statementId] = {
          I_agree: 0,
          others_agree: 0,
        };
      }
      //if the there is more than one user who has answered the statement -- more likely case
    } else {
      const actualIAgree = answersForStatement.reduce(
        (acc, answer) => acc + (answer.I_agree ? 1 : 0),
        0
      );
      const actualIAgreePercentage = (actualIAgree / totalAnswers) * 100;
      let count = 0;
      for (let i = 0; i < totalAnswers; i++) {
        if (answersForStatement[i].I_agree === 1) {
          count++;
        }
      }
      const perceptionAccuracy = (count / totalAnswers) * 100;
      result[statementId] = {
        I_agree: actualIAgreePercentage,
        others_agree: perceptionAccuracy,
      };
    }
  }
  return result;
};

//endpoint to get agreement percentages (ex. 60% of people agreed with you)
router.post(
  "/agreementPercentage",
  [body("statementIds").isArray().withMessage("statementIds must be an array")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { statementIds } = req.body;
    console.log("Received statementIds:", statementIds);

    try {
      const agreementPercentages = await calculateAgreementPercentage(
        statementIds
      );
      res.json(agreementPercentages);
    } catch (error) {
      console.error("Error calculating agreement percentages:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
