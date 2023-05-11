const express = require('express');
const router = express.Router();
const { answers } = require('../models')

const { body, validationResult } = require('express-validator');


router.post(
    '/',
    body('statementId').not().isEmpty().isInt({ min: 1 }),
    body('questionOneAgree').not().isEmpty().isInt({ min: 0, max: 1 }),
    body('questionOneWhy').not().isEmpty().isInt({ min: 0, max: 3 }),
    body('questionTwoAgree').not().isEmpty().isInt({ min: 0, max: 1 }),
    body('questionTwoWhy').not().isEmpty().isInt({ min: 0, max: 3 }),
    body('questionThreeAgree').not().isEmpty().isInt({ min: 0, max: 1 }),
    body('questionThreeWhy').not().isEmpty().isInt({ min: 0, max: 3 }),

    (req, res) => {
      // Finds the validation errors in this request and wraps them in an object with handy functions
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      } else {
        answers.create({

          statementId: req.body.statementId,
          questionOneAgree: req.body.questionOneAgree,
          questionOneWhy: req.body.questionOneWhy,
          questionTwoAgree: req.body.questionTwoAgree,
          questionTwoWhy: req.body.questionTwoWhy,
          questionThreeAgree: req.body.questionTwoAgree,
          questionThreeWhy: req.body.questionThreeWhy,
          origLanguage: "en",
          sessionId: req.body.sessionId,

        }).then(answer => res.json(answer));
      }
      
  
  
    
    });

module.exports = router;