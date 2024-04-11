const { GetStatementById } = require("../treatments/statement-by-id.treatment");

const defaultTreatment = [
  {
    params: {
      statementIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    },
    validity: (req) => false,
    function: GetStatementById,
  },
];

const experiment = {
  name: "default",
  treatments: defaultTreatment,
  treatmentAssigner: () => defaultTreatment[0],
};

module.exports = experiment;
