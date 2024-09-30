const { GetStatementById } = require("../treatments/statement-by-id.treatment");

const designPoints = [
  {
    // 0	1	0	0	0	0
    params: {
      ids: [
        8830, 8831, 8832, 8833, 8834, 8835, 8836, 8837, 8838, 8839, 8840, 8841,
        8842, 8843, 8844,
      ],
    },
    validity: (req) => {
      return req.query.source != "mturk";
    },
    function: GetStatementById,
  },
  // 1	1	0	1	1	1
  {
    params: {
      ids: [
        8845, 8846, 8847, 8848, 8849, 8850, 8851, 8852, 8853, 8854, 8855, 8856,
        8857, 8858, 8859,
      ],
    },
    validity: (req) => {
      return req.query.source != "mturk";
    },
    function: GetStatementById,
  },
  // 0  0	0	0	0	0
  {
    params: {
      ids: [
        4559, 4604, 4633, 4660, 5024, 5094, 5128, 6646, 6800, 7162, 7228, 7469,
        7615, 8748, 4781,
      ],
    },
    validity: (req) => {
      return req.query.source != "mturk";
    },
    function: GetStatementById,
  },
  // 0  0	0	0	0	1
  {
    params: {
      ids: [
        5128, 6646, 6800, 7162, 7228, 7469, 7615, 8748, 4422, 4451, 4573, 4613,
        7576, 7690, 7615,
      ],
    },
    validity: (req) => {
      return req.query.source != "mturk";
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
