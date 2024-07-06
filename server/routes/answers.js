const router = require("express").Router();
require("dotenv").config();
const jwt_secret = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");
const controller = require("../controllers/answers.js");
const { statements, users, answers } = require("../models");

const { header, body, validationResult } = require("express-validator");

router.get("/", (req, res) => {
  res.status(200).json({ message: "Answer route" });
});

router.post(
  "/",
  body("statementId").not().isEmpty().isInt({ min: 1 }),
  body("I_agree").not().isEmpty().isInt({ min: 0, max: 1 }),
  body("I_agree_reason").not().isEmpty(),
  body("others_agree").not().isEmpty().isInt({ min: 0, max: 1 }),
  body("others_agree_reason").not().isEmpty(),
  body("perceived_commonsense").not().isEmpty().isInt({ min: 0, max: 1 }),
  body("clarity").optional({ nullable: true, checkFalsy: true }),

  (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      const answerData = {
        statementId: req.body.statementId,
        statement_number: req.body.statementId,
        I_agree: req.body.I_agree,
        I_agree_reason: req.body.I_agree_reason,
        others_agree: req.body.others_agree,
        others_agree_reason: req.body.others_agree_reason,
        perceived_commonsense: req.body.perceived_commonsense,
        origLanguage: "en",
        sessionId: req.body.sessionId,
        clientVersion: process.env.GITHUB_HASH,
      };

      if (req.body.clarity !== "") {
        answerData.clarity = req.body.clarity;
      }

      answers
        .create(answerData)
        .then((answer) => res.json(answer))
        .catch((error) => {
          console.error(error);
          res.status(500).json({ error: "An error occurred" });
        });
    }
  }
);

function getSessionId(email) {
  return new Promise((resolve, reject) => {
    users
      .findOne({ where: { email: email } })
      .then((user) => {
        resolve(user ? user.sessionId : null);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

router.post(
  "/getanswers",

  body("email")
    .exists()
    .withMessage("Email field is missing")
    .isEmail()
    .withMessage("Invalid email format"),
  header("Authorization")
    .exists()
    .withMessage("Authorization header is missing")
    .isString()
    .withMessage("Authorization header must be a string")
    .notEmpty()
    .withMessage("Authorization header cannot be empty"),

  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      const token = req.headers.authorization;
      jwt.verify(token, jwt_secret, (err, succ) => {
        if (err) {
          res.json({ ok: false, message: "something went wrong" });
        } else {
          getSessionId(succ.email)
            .then((sessionID) => {
              if (sessionID) {
                answers
                  .findAll({
                    where: {
                      sessionId: sessionID,
                    },
                    include: [
                      {
                        model: statements,
                        as: "statement",
                        attributes: ["statement"],
                      },
                    ],
                    order: [["createdAt", "DESC"]],
                  })
                  .then((result) => {
                    // Filter results to get unique sessionId entries
                    const uniqueResults = result.filter((item, index, self) => {
                      i = 0;
                      while (i < result.length) {
                        if (item.statementId == result[i].statementId) {
                          if (item.id < result[i].id) {
                            return false;
                          }
                        }
                        i++;
                      }
                      return true;
                    }
                    );
                    res.json(uniqueResults);
                    console.log("results successfully filtered");
                  })
                  .catch((error) => {
                    res.json({ ok: false, message: error.message });
                  });
              } else {
                res.json({ ok: false, message: "No session ID found" });
              }
            })
            .catch((error) => {
              res.json({ ok: false, message: error.message });
            });
        }
      });
    }
  }
);

// route for updating user answers

router.post(
  "/changeanswers",
  body("statementId").not().isEmpty().isInt({ min: 1 }),
  body("I_agree").not().isEmpty().isInt({ min: 0, max: 1 }),
  body("others_agree").not().isEmpty().isInt({ min: 0, max: 1 }),
  header("Authorization")
    .exists()
    .withMessage("Authorization header is missing")
    .isString()
    .withMessage("Authorization header must be a string")
    .notEmpty()
    .withMessage("Authorization header cannot be empty"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const token = req.headers.authorization;
    jwt.verify(token, jwt_secret, async (err, succ) => {
      if (err) {
        res.json({ ok: false, message: "something went wrong" });
      } else {
        try {
          const sessionID = await getSessionId(succ.email);
          if (sessionID) {
            const answerData = {
              statementId: req.body.statementId,
              statement_number: req.body.statementId,
              I_agree: req.body.I_agree,
              I_agree_reason: req.body.I_agree_reason,
              others_agree: req.body.others_agree,
              others_agree_reason: req.body.others_agree_reason,
              perceived_commonsense: req.body.perceived_commonsense,
              origLanguage: "en",
              sessionId: req.body.sessionId,
              clientVersion: process.env.GITHUB_HASH,
            };
            answers
            .create(answerData)
            .then((answer) => res.json({ ok: true, message: "Answer added successfully" }))
            .catch((error) => {
              console.error(error);
              res.status(500).json({ ok: false, message: "An error occurred" });
            });
          }
        } catch (error) {
          res.json({ ok: false, message: error.message });
        }
      }
    });
  }
);

module.exports = router;
