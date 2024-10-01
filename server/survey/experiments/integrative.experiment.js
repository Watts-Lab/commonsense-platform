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
  {
    // behavior = 0
    // everyday = 1
    // figure_of_speech = 0
    // judgment = 0
    // opinion = 0
    // reasoning = 0
    params: {
      ids: [
        8860, 8861, 8862, 8863, 8864, 8865, 8866, 8867, 8868, 8869, 8870, 8871,
        8872, 8873, 8874,
      ],
    },
    validity: (req) => {
      return req.query.source != "mturk";
    },
    function: GetStatementById,
  },
  {
    // behavior = 1
    // everyday = 0
    // figure_of_speech = 0
    // judgment = 1
    // opinion = 1
    // reasoning = 0
    params: {
      ids: [
        8875, 8876, 8877, 8878, 8879, 8880, 8881, 8882, 8883, 8884, 8885, 8886,
        8887, 8888, 8889,
      ],
    },
    validity: (req) => {
      return req.query.source != "mturk";
    },
    function: GetStatementById,
  },
  {
    // behavior = 1
    // everyday = 1
    // figure_of_speech = 0
    // judgment = 1
    // opinion = 0
    // reasoning = 0
    params: {
      ids: [
        8890, 8891, 8892, 8893, 8894, 8895, 8896, 8897, 8898, 8899, 8900, 8901,
        8902, 8903, 8904,
      ],
    },
    validity: (req) => {
      return req.query.source != "mturk";
    },
    function: GetStatementById,
  },
  {
    // behavior = 1
    // everyday = 1
    // figure_of_speech = 0
    // judgment = 1
    // opinion = 1
    // reasoning = 0
    params: {
      ids: [
        8905, 8906, 8907, 8908, 8909, 8910, 8911, 8912, 8913, 8914, 8915, 8916,
        8917, 8918, 8919,
      ],
    },
    validity: (req) => {
      return req.query.source != "mturk";
    },
    function: GetStatementById,
  },
  {
    // behavior = 1
    // everyday = 1
    // figure_of_speech = 0
    // judgment = 1
    // opinion = 1
    // reasoning = 1
    params: {
      ids: [
        8920, 8921, 8922, 8923, 8924, 8925, 8926, 8927, 8928, 8929, 8930, 8931,
        8932, 8933, 8934,
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
