const treatments = require("../survey/treatments");
const experiments = require("../survey/experiments");

const returnStatements = async (req, res) => {
  const resArray = await Promise.all(
    experiments[0].treatments.map(async (treatmentFunction) => {
      const result = await treatmentFunction;
      return result;
    })
  );

  console.log("resArray: ", resArray);

  return res.json({ resArray });
};

module.exports = {
  returnStatements,
};
