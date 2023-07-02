const router = require("express").Router();
const controller = require("../controllers/users");

router.post("/enter", controller.login);
router.post("/verify", controller.verify_token);
router.post("/deleteaccount", controller.delete_account);

module.exports = router;
