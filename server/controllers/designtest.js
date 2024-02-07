const treatments = require("../survey/treatments");

const returnStatements = async (req, res) => {
  console.log(treatments);

  return res.json({ message: "success" });
};

module.exports = {
  returnStatements,
};
