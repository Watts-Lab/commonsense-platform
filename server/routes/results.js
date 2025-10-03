const express = require("express");
const router = express.Router();
const { answers, statements, sequelize } = require("../models");

const { body, query, validationResult } = require("express-validator");

const { Sequelize, literal } = require("sequelize");

router.get("/", (req, res) => {
  res.status(200).json({ message: "Result route" });
});

router.post(
  "/",
  [body("sessionId").notEmpty().withMessage("sessionId is required")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const results = await answers.findAll({
        where: {
          sessionId: req.body.sessionId,
        },
        include: [
          {
            model: statements,
            as: "statement",
            attributes: ["statementMedian"],
          },
        ],
        attributes: ["statementId", "I_agree", "perceived_commonsense"],
        raw: true,
        nest: true,
      });

      const processed = results
        .map((row) => ({
          awareness: Number(
            row.perceived_commonsense === row.statement.statementMedian
          ),
          consensus: Number(row.I_agree === row.statement.statementMedian),
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
        );

      const finalData = {
        ...processed,
        commonsensicality: Math.sqrt(processed.awareness * processed.consensus),
      };

      res.json(finalData);

      setImmediate(async () => {
        try {
          await sequelize.query("CALL update_statement_median;", {
            type: sequelize.QueryTypes.RAW,
          });
          console.log("Median updated");
        } catch (error) {
          console.error("Error updating median:", error);
        }
      });
    } catch (error) {
      console.error("Error executing the query:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.get("/all", async (req, res) => {
  try {
    const results = await sequelize.query(
      `
      SELECT 
        a.sessionId,
        COUNT(*) as answer_count,
        SUM(CASE WHEN a.perceived_commonsense = s.statementMedian THEN 1 ELSE 0 END) as awareness_sum,
        SUM(CASE WHEN a.I_agree = s.statementMedian THEN 1 ELSE 0 END) as consensus_sum
      FROM answers a
      INNER JOIN statements s ON a.statementId = s.id
      GROUP BY a.sessionId
      HAVING answer_count >= 5
    `,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const output = [];
    const requestSessionId = req.query.sessionId;
    let userIndex = 1;

    for (const row of results) {
      const awareness = row.awareness_sum / row.answer_count;
      const consensus = row.consensus_sum / row.answer_count;
      const commonsensicality = Math.sqrt(awareness * consensus);

      if (row.sessionId === requestSessionId) {
        output.push({
          sessionId: "You",
          commonsensicality,
        });
      } else {
        output.push({
          sessionId: "user" + userIndex,
          commonsensicality,
        });
        userIndex++;
      }
    }

    res.json(output);
  } catch (error) {
    console.error("Error executing the query:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const calculateAgreementPercentage = async (statementIds) => {
  const result = {};

  const answersForStatementAll = await sequelize.query(
    `
    SELECT 
      sessionId,
      createdAt,
      statementId,
      I_agree,
      others_agree
    FROM (
      SELECT 
        a.sessionId,
        a.createdAt,
        a.statementId,
        a.I_agree,
        a.others_agree,
        ROW_NUMBER() OVER (
          PARTITION BY a.sessionId, a.statementId 
          ORDER BY a.createdAt DESC
        ) as rn
      FROM answers a
      WHERE a.statementId IN (${statementIds.map(() => "?").join(",")})
    ) AS ranked
    WHERE rn = 1
  `,
    {
      replacements: statementIds,
      type: sequelize.QueryTypes.SELECT,
    }
  );

  const groupedAnswers = {};
  answersForStatementAll.forEach((answer) => {
    if (!groupedAnswers[answer.statementId]) {
      groupedAnswers[answer.statementId] = [];
    }
    groupedAnswers[answer.statementId].push(answer);
  });

  for (const statementId of statementIds) {
    const answersForStatement = groupedAnswers[statementId] || [];
    const totalAnswers = answersForStatement.length;

    if (totalAnswers === 0) {
      result[statementId] = { I_agree: 0, others_agree: 0 };
      continue;
    }

    if (totalAnswers === 1) {
      const answer = answersForStatement[0];
      if (answer.I_agree == 1 && answer.others_agree == 1) {
        result[statementId] = { I_agree: 100, others_agree: 100 };
      } else if (answer.I_agree == 0 && answer.others_agree == 1) {
        result[statementId] = { I_agree: 0, others_agree: 0 };
      } else if (answer.I_agree == 1 && answer.others_agree == 0) {
        result[statementId] = { I_agree: 100, others_agree: 100 };
      } else {
        result[statementId] = { I_agree: 0, others_agree: 0 };
      }
    } else {
      const actualIAgree = answersForStatement.reduce(
        (acc, answer) => acc + (answer.I_agree ? 1 : 0),
        0
      );
      const actualIAgreePercentage = (actualIAgree / totalAnswers) * 100;

      result[statementId] = {
        I_agree: actualIAgreePercentage,
        others_agree: actualIAgreePercentage,
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
