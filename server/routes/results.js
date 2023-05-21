const express = require('express');
const router = express.Router();
const {
    answers,
    statements
} = require('../models')


const {
    body,
    validationResult
} = require('express-validator');

const {
    Sequelize
} = require('sequelize');


router.get("/:sessionId", async (req, res) => {

    
    await answers.findAll({
            where: {
                sessionId: req.params.sessionId
            },
            include: [{
                model: statements,
                as: 'statement'
            }],
            attributes: ['statementId', 'questionOneAgree', 'questionThreeAgree', [Sequelize.col('statement.statementMedian'), 'statementMedian']],
            raw: true
        }).then(results =>
            // Process the query results
            results.map(row => ({
                awareness: Number(row.questionThreeAgree === row.statementMedian),
                consensus: Number(row.questionOneAgree === row.statementMedian),
            }))
            .reduce((avg, value, index, array) => ({
                    awareness: avg.awareness + value.awareness / array.length,
                    consensus: avg.consensus + value.consensus / array.length
                  }), {
                awareness: 0,
                consensus: 0
            }))
        .then(data => ({
            ...data,
            commonsensicality: Math.sqrt(data.awareness * data.consensus)
        }))
        .then(data => res.json(data))
        .catch(error => {
            // Handle any errors that occur during the query
            console.error('Error executing the query:', error);
        });

});

module.exports = router;