const { GetStatementById } = require("../treatments/statement-by-id.treatment");

const defaultTreatment = [
  {
    params: {
      statementIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    },
    function: GetStatementById,
  },
];

const experiment = {
  name: "design-point",
  treatments: defaultTreatment,
  treatmentSelector: () => defaultTreatment[0],
};

module.exports = experiment;
