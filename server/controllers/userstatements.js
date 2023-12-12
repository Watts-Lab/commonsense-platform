const { validationResult } = require("express-validator");
const { userstatements } = require("../models");
const { getUserIdFromToken } = require("./authhelper");

const createUserStatement = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { statementText, statementProperties } = req.body;
    const token = req.headers.authorization;
    const userId = await getUserIdFromToken(token);

    const newUserStatement = await userstatements.create({
      userId,
      statementText,
      statementProperties,
    });

    return res.status(201).json(newUserStatement);
  } catch (error) {
    console.error("Error creating a user statement:", error);
    return res
      .status(500)
      .json({ error: error.message || "Internal Server Error" });
  }
};

module.exports = {
  createUserStatement,
};
