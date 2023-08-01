const router = require("express").Router();
const { body } = require("express-validator");

const controller = require("../controllers/feedbacks");

router.post(
  "/",
  body("type").not().isEmpty(),
  body("comment").not().isEmpty(),
  controller.saveFeedBack
);

module.exports = router;
