const { feedbacks } = require("../models");
const { header, body, validationResult } = require("express-validator");

async function saveFeedBack(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  } else {
    const feedbackData = {
      type: req.body.type,
      comment: req.body.comment,
    };

    feedbacks
      .create(feedbackData)
      .then((answer) => res.json(answer))
      .catch((error) => {
        console.error(error);
        res.status(500).json({ error: "An error occurred" });
      });
  }
}

module.exports = {
  saveFeedBack,
};
