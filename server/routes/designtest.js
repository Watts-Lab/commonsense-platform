const router = require("express").Router();
const controller = require("../controllers/designtest");

router.get("/", controller.returnStatements);

module.exports = router;
