const express = require('express');
const router = express.Router();
const { statements, statementproperties } = require('../models')

const Sequelize = require('sequelize');

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

router.get("/:statementId", async (req, res) => {
    const statementList = await statements.findAll({
        where: {
            id: req.params.statementId
        },
        include: statementproperties,
    });
    res.json(statementList);
});


module.exports = router;