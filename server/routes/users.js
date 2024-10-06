const router = require("express").Router();
const controller = require("../controllers/users");
const { header } = require("express-validator");

router.post("/enter", controller.login);
router.post(
  "/verify",
  [
    header("Authorization")
      .exists()
      .withMessage("Authorization header is missing")
      .isString()
      .withMessage("Authorization header must be a string")
      .notEmpty()
      .withMessage("Authorization header cannot be empty"),
  ],
  controller.verify_token
);
router.post(
  "/deleteaccount",
  [
    header("Authorization")
      .exists()
      .withMessage("Authorization header is missing")
      .isString()
      .withMessage("Authorization header must be a string")
      .notEmpty()
      .withMessage("Authorization header cannot be empty"),
  ],
  controller.delete_account
);

module.exports = router;
