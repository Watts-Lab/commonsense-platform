const router = require("express").Router();
const controller = require("../controllers/experiment");

router.get("/", controller.returnStatements);
router.post("/", controller.returnStatements);

module.exports = router;
