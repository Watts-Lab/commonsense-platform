const express = require("express");
const router = express.Router();
const { answers, statements } = require("../models");

const { query, validationResult } = require("express-validator");

const { Sequelize, literal } = require("sequelize");

router.post(
  "/",
  [query("sessionId").notEmpty().withMessage("sessionId is required")],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    await answers
      .findAll({
        where: {
          sessionId: req.query.sessionId,
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
        const output = [];
        Object.keys(data).forEach(function (key, index) {
          data[key]["commonsensicality"] = Math.sqrt(
            data[key]["awareness"] * data[key]["consensus"]
          );
          output.push({
            sessionId: "user" + index,
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

module.exports = router;
