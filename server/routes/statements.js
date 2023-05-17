const express = require('express');
const router = express.Router();
const { statements, statementproperties, answers } = require('../models')

const Sequelize = require('sequelize');

function getRandom(arr, n) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}

router.get("/", async (req, res) => {
    // res.send("hello");
    const statementList = await statements.findAll({
        where: {
            id: [6, 149, 2009, 2904, 3621]
        },
        // include: statementproperties,
        // order: Sequelize.literal('rand()')
    });
    res.json(statementList);
});

router.get("/byid/:statementId", async (req, res) => {
    const statementList = await statements.findAll({
        where: {
            id: req.params.statementId
        },
        // include: statementproperties,
    });
    res.json(statementList);
});

router.get("/next", async (req, res) => {
    const statementList = await statements.findAll({
        where: {
            id: {
                [Sequelize.Op.notIn]: [6, 149, 2009, 2904, 3621]
            }
        },
        attributes: { 
            include: [
                [Sequelize.fn("COUNT", Sequelize.col("answers.statementId")), "statementCount"]
            ],
            exclude: [
                'statementSource', 'origLanguage', 'published', 'createdAt', 'updatedAt'
            ]
        },
        include: [{
            model: answers, attributes: []
        }],
        group: ['statements.id']
    });
    res.json(getRandom(statementList, 10));
});

module.exports = router;