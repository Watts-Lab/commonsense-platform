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
        // console.log(req.sessionID);
        const output = [];
        Object.keys(data).forEach(function (key, index) {
          data[key]["commonsensicality"] = Math.sqrt(
            data[key]["awareness"] * data[key]["consensus"]
          );
          output.push({
            sessionId: key === req.sessionID ? "You" : "user" + index,
            commonsensicality: Math.sqrt(
              data[key]["awareness"] * data[key]["consensus"]
            ),
          });
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

// Helper function to calculate commonsensicality
const calculateCommonsensicality = async (statementIds) => {
  const result = {};
  for (const statementId of statementIds) {
    const answersForStatement = await answers.findAll({
      where: { statementId },
      include: [
        {
          model: statements,
          as: "statement",
          attributes: [],
        },
      ],
      attributes: [
        "I_agree",
        "perceived_commonsense",
        [Sequelize.col("statement.statementMedian"), "statementMedian"],
      ],
      raw: true,
    });

    const total = answersForStatement.length;
    if (total === 0) {
      result[statementId] = 0;
      continue;
    }

    // Calculate consensus (ci)
    const consensusSum = answersForStatement.reduce(
      (acc, answer) => acc + answer.I_agree,
      0
    );
    const consensus = 2 * Math.abs((consensusSum / total) - 0.5);

    // Calculate majority
    const majority = consensusSum / total >= 0.5 ? 1 : 0;

    // Calculate awareness (ai)
    const awareness = answersForStatement.reduce(
      (acc, answer) => acc + (answer.perceived_commonsense === majority ? 1 : 0),
      0
    ) / total;

    // Calculate commonsensicality (mi)
    result[statementId] = Math.sqrt(consensus * awareness);
  }
  return result;
};

//endpoint to get commonsensicality scores for each question
router.post(
  "/commonsensicality",
  [body("statementIds").isArray().withMessage("statementIds must be an array")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { statementIds } = req.body;
    console.log("Received statementIds:", statementIds);

    try {
      const commonsensicalityScores = await calculateCommonsensicality(statementIds);
      console.log("Calculated commonsensicalityScores:", commonsensicalityScores);
      res.json(commonsensicalityScores);
    } catch (error) {
      console.error("Error calculating commonsensicality:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Helper function to calculate agreement percentages
const calculateAgreementPercentage = async (statementIds) => {
  const result = {};
  console.log("statementIds: " + statementIds.length);
  for (const statementId of statementIds) {
    const answersForStatementAll = await answers
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
        "id",
        "statementId",
        "I_agree",
        "others_agree",   
      ],
      raw: true,
      where: {
        statementId: statementId
      }
    });

    if (answersForStatementAll.length === 0) {
      result[statementId] = { I_agree: 0, others_agree: 0 };
      continue;
    };
    const answersForStatement = answersForStatementAll.filter((item, index, self) => {
        i = 0;
        while (i < answersForStatementAll.length) {
          if (item.sessionId == answersForStatementAll[i].sessionId) {
            if (item.id < answersForStatementAll[i].id) {
              return false;
            }
          }
          i++;
      }
        return true;
      });
    
    console.log("Answers test", answersForStatement[0]);

    const totalAnswers = answersForStatement.length;
    const actualIAgree = answersForStatement.reduce((acc, answer) => acc + (answer.I_agree ? 1 : 0), 0);
    const actualIAgreePercentage = (actualIAgree / totalAnswers) * 100;

    console.log("total answers" + totalAnswers);
    console.log("original" + answersForStatementAll.length);

    const perceptionAccuracy = answersForStatement.reduce((acc, answer) => {
      if (answer.others_agree === 1) { // if others_agree is yes
        return acc + actualIAgreePercentage;
      } else { // if others_agree is no
        return acc + (100 - actualIAgreePercentage);
      }
    }, 0) / totalAnswers;

    result[statementId] = {
      I_agree: actualIAgreePercentage,
      others_agree: perceptionAccuracy,
    };
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
      const agreementPercentages = await calculateAgreementPercentage(statementIds);
      console.log("Calculated agreementPercentages:", agreementPercentages);
      res.json(agreementPercentages);
    } catch (error) {
      console.error("Error calculating agreement percentages:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
