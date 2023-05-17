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
    body('questionThreeWhy').isInt({ min: 0, max: 2 }).optional({ nullable: true, checkFalsy: true }),

    (req, res) => {
      // Finds the validation errors in this request and wraps them in an object with handy functions
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      } else {
        
        if(req.body.questionThreeWhy === "") {
          answers.create({
          
            statementId: req.body.statementId,
            questionOneAgree: req.body.questionOneAgree,
            questionOneWhy: req.body.questionOneWhy,
            questionTwoAgree: req.body.questionTwoAgree,
            questionTwoWhy: req.body.questionTwoWhy,
            questionThreeAgree: req.body.questionTwoAgree,
            origLanguage: "en",
            sessionId: req.body.sessionId,
  
          }).then(answer => res.json(answer));
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
        
      }
      
  
  
    
    });

router.get("/session/:sessionId/statement/:statementId", async (req, res) => {
  const answerList = await answers.findAll({
      limit: 1,
      where: {
          sessionId: req.params.sessionId,
          statementId: req.params.statementId
      },
      order: [ [ 'createdAt', 'DESC' ]]
  });
  res.json(answerList);
});

module.exports = router;