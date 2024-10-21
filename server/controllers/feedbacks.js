const { feedbacks } = require("../models");
const { send_report } = require("./emails.js");
const { header, body, validationResult } = require("express-validator");

async function saveFeedBack(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  } else {
    const type = req.body.type;
    const comment = req.body.comment;
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

    send_report("markew@seas.upenn.edu", comment, type);
    send_report("amirhossein.nakhaei@rwth-aachen.de", comment, type);
  }
}

module.exports = {
  saveFeedBack,
};
