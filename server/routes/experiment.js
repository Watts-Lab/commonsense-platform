const router = require("express").Router();
const controller = require("../controllers/experiment");

router.get("/", (req, res) => {
  res.status(200).json({ message: "Answer route" });
});
router.post("/", controller.returnStatements);

module.exports = router;
