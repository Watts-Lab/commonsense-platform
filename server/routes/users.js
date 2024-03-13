const router = require("express").Router();
const controller = require("../controllers/users");

router.get("/", (req, res) => {
    res.status(200).json({ message: "Users route" });
  });
router.post("/enter", controller.login);
router.post("/verify", controller.verify_token);
router.post("/deleteaccount", controller.delete_account);

module.exports = router;
