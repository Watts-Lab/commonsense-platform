const router = require("express").Router();
const { body } = require("express-validator");

const controller = require("../controllers/feedbacks");

router.get("/", (req, res) => {
  res.status(200).json({ message: "Answer route" });
});

router.post(
  "/",
  body("type").not().isEmpty(),
  body("comment").not().isEmpty(),
  controller.saveFeedBack
);

module.exports = router;
