const { GetStatementById } = require("../treatments/statement-by-id.treatment");

const designPoints = [
  {
    params: {
      ids: [
        8830, 8831, 8832, 8833, 8834, 8835, 8836, 8837, 8838, 8839, 8840, 8841,
        8842, 8843, 8844,
      ],
    },
    function: GetStatementById,
  },
  {
    params: {
      ids: [
        8845, 8846, 8847, 8848, 8849, 8850, 8851, 8852, 8853, 8854, 8855, 8856,
        8857, 8858, 8859,
      ],
    },
    function: GetStatementById,
  },
];

const experiment = {
  experimentName: "design-point",
  treatments: designPoints,
  treatmentAssigner: (subject, treatments) => {
    return treatments[Math.floor(Math.random() * treatments.length)];
  },
};

module.exports = experiment;
