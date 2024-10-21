const router = require("express").Router();
const controller = require("../controllers/experiment");
const { body, query } = require("express-validator");

router.get(
  "/",
  [query("sessionId").not().isEmpty().withMessage("sessionId is required")],
  controller.returnStatements
);
router.post(
  "/save",
  [
    body("experimentId")
      .not()
      .isEmpty()
      .withMessage("experimentId is required")
      .isInt({ min: 1 })
      .withMessage("experimentId should be a positive integer"),
  ],
  controller.saveExperiment
);
router.post("/individual", controller.saveIndividual);

module.exports = router;
