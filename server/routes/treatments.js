const router = require("express").Router();
const controller = require("../controllers/treatments.js");

router.get("/", controller.baseStatements);

module.exports = router;
