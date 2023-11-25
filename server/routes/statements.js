const router = require("express").Router();
const controller = require("../controllers/statements.js");

router.get("/", controller.baseStatements);
router.get("/next", controller.next);
router.get("/byid/:statementId", controller.statementById);
router.post("/submit-statement", controller.saveSubmitedStatements);


module.exports = router;
