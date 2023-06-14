const express = require("express");
const router = express.Router();
const { answers, statements } = require("../models");

const { query, validationResult } = require("express-validator");

const { Sequelize } = require("sequelize");

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
            awareness: Number(row.perceived_commonsense === row.statementMedian),
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

module.exports = router;


