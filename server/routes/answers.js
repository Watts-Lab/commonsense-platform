const express = require('express');
const router = express.Router();
const { answers } = require('../models')

const { body, validationResult } = require('express-validator');

// router.post("/", async (req, res) => {
    
//     const answer = req.body;

//     console.log(answer.hey);

//     // await answers.create(answer);

//     res.json(answer);
// });

router.post(
    '/',
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
        res.json(req.body);
      }
  
    //   User.create({
    //     username: req.body.username,
    //     password: req.body.password,
    //   }).then(user => res.json(user));
    
    });

module.exports = router;