const router = require("express").Router();
const controller = require("../controllers/experiment");

router.get("/", controller.returnStatements);
router.post("/", controller.returnStatements);
router.post("/individual", controller.saveIndividual);

module.exports = router;
