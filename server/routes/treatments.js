const router = require("express").Router();
const controller = require("../controllers/treatments.js");

router.get("/", controller.getTreatment);
router.get("/all", controller.readTreatments);
router.get("/update", controller.updateTreatment);
router.get("/readspace", controller.readSpace);

module.exports = router;
