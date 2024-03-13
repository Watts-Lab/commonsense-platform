const treatments = require("../survey/treatments");
const experiments = require("../survey/experiments");

const returnStatements = async (req, res) => {
  console.log(await experiments.getExperiment());
  const statements = await treatments.DesignPointRandomized({
    randomSeed: 13,
    numberOfStatements: 15,
    desingPointParams: {
      behavior: 1,
      everyday: 0,
      figure_of_speech: 0,
      judgment: 1,
      opinion: 1,
      reasoning: 1,
    },
  });
  return res.json({ statements, length: statements.length });
};

module.exports = {
  returnStatements,
};
