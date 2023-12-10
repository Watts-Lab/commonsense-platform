// routes/userstatements.js
const router = require("express").Router();
const { body } = require("express-validator");
const controller = require("../controllers/userstatements");

router.post(
  "/create",
  [
    body("statementText")
      .trim()
      .notEmpty()
      .withMessage("Statement text is required"),
    body("statementProperties")
      .notEmpty()
      .withMessage("Statement properties are required"),
  ],
  controller.createUserStatement
);

module.exports = router;
