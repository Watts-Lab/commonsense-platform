const {
  GetStatementByLanguage,
} = require("../treatments/statement-by-language.treatment");

const internationalStatements = [
  {
    params: {},
    validity: (req) => {
      return req.body.language === "En";
    },
    function: GetStatementByLanguage,
  },
];

const experiment = {
  experimentName: "international-experiment",
  treatments: internationalStatements,
  treatmentAssigner: () => {},
};

module.exports = experiment;
