const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwt_secret = process.env.JWT_SECRET;
const { statements, users, answers } = require("../models");

const { header, body, validationResult } = require("express-validator");

router.post(
  "/",
  body("statementId").not().isEmpty().isInt({ min: 1 }),
  body("questionOneAgree").not().isEmpty().isInt({ min: 0, max: 1 }),
  body("questionOneWhy").not().isEmpty().isInt({ min: 0, max: 3 }),
  body("questionTwoAgree").not().isEmpty().isInt({ min: 0, max: 1 }),
  body("questionTwoWhy").not().isEmpty().isInt({ min: 0, max: 3 }),
  body("questionThreeAgree").not().isEmpty().isInt({ min: 0, max: 1 }),
  body("questionThreeWhy")
    .isInt({ min: 0, max: 2 })
    .optional({ nullable: true, checkFalsy: true }),

  (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      console.log("email", req.sessionID);
      if (req.body.questionThreeWhy === "") {
        answers
          .create({
            statementId: req.body.statementId,
            questionOneAgree: req.body.questionOneAgree,
            questionOneWhy: req.body.questionOneWhy,
            questionTwoAgree: req.body.questionTwoAgree,
            questionTwoWhy: req.body.questionTwoWhy,
            questionThreeAgree: req.body.questionTwoAgree,
            origLanguage: "en",
            sessionId: req.body.sessionId,
          })
          .then((answer) => res.json(answer));
      } else {
        answers
          .create({
            statementId: req.body.statementId,
            questionOneAgree: req.body.questionOneAgree,
            questionOneWhy: req.body.questionOneWhy,
            questionTwoAgree: req.body.questionTwoAgree,
            questionTwoWhy: req.body.questionTwoWhy,
            questionThreeAgree: req.body.questionTwoAgree,
            questionThreeWhy: req.body.questionThreeWhy,
            origLanguage: "en",
            sessionId: req.body.sessionId,
          })
          .then((answer) => res.json(answer));
      }
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
              console.log(sessionID);
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
                        attributes: ['statement'],
                      },
                    ],
                    order: [["createdAt", "DESC"]],
                  })
                  .then((result) => {
                    res.json(result);
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

module.exports = router;
