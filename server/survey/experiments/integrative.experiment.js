const { GetStatementById } = require("../treatments/statement-by-id.treatment");
const {
  FindLeastFrequentFinishedExperiment,
} = require("./utils/reverse-weight-selector");
const { stringy } = require("../treatments/utils/id-generator");

const designPoints = [
  // {
  //   // behavior = 0 everyday = 1 figure_of_speech = 0 judgment = 0 opinion = 0 reasoning = 0
  //   params: {
  //     ids: [
  //       8830, 8831, 8832, 8833, 8834, 8835, 8836, 8837, 8838, 8839, 8840, 8841,
  //       8842, 8843, 8844,
  //     ],
  //   },
  //   validity: (req, params) => {
  //     return req.query.source != "mturk";
  //   },
  //   function: GetStatementById,
  // },
  // // behavior = 1 everyday = 1 figure_of_speech = 0 judgment = 1 opinion = 1 reasoning = 1
  // {
  //   params: {
  //     ids: [
  //       8845, 8846, 8847, 8848, 8849, 8850, 8851, 8852, 8853, 8854, 8855, 8856,
  //       8857, 8858, 8859,
  //     ],
  //   },
  //   validity: (req, params) => {
  //     return req.query.source != "mturk";
  //   },
  //   function: GetStatementById,
  // },
  // {
  //   // behavior = 0
  //   // everyday = 1
  //   // figure_of_speech = 0
  //   // judgment = 0
  //   // opinion = 0
  //   // reasoning = 0
  //   params: {
  //     ids: [
  //       8860, 8861, 8862, 8863, 8864, 8865, 8866, 8867, 8868, 8869, 8870, 8871,
  //       8872, 8873, 8874,
  //     ],
  //   },
  //   validity: (req, params) => {
  //     return req.query.source != "mturk";
  //   },
  //   function: GetStatementById,
  // },
  // {
  //   // behavior = 1
  //   // everyday = 0
  //   // figure_of_speech = 0
  //   // judgment = 1
  //   // opinion = 1
  //   // reasoning = 0
  //   params: {
  //     ids: [
  //       8875, 8876, 8877, 8878, 8879, 8880, 8881, 8882, 8883, 8884, 8885, 8886,
  //       8887, 8888, 8889,
  //     ],
  //   },
  //   validity: (req, params) => {
  //     return req.query.source != "mturk";
  //   },
  //   function: GetStatementById,
  // },
  // {
  //   // behavior = 1
  //   // everyday = 1
  //   // figure_of_speech = 0
  //   // judgment = 1
  //   // opinion = 0
  //   // reasoning = 0
  //   params: {
  //     ids: [
  //       8890, 8891, 8892, 8893, 8894, 8895, 8896, 8897, 8898, 8899, 8900, 8901,
  //       8902, 8903, 8904,
  //     ],
  //   },
  //   validity: (req, params) => {
  //     return req.query.source != "mturk";
  //   },
  //   function: GetStatementById,
  // },
  // {
  //   // behavior = 1
  //   // everyday = 1
  //   // figure_of_speech = 0
  //   // judgment = 1
  //   // opinion = 1
  //   // reasoning = 0
  //   params: {
  //     ids: [
  //       8905, 8906, 8907, 8908, 8909, 8910, 8911, 8912, 8913, 8914, 8915, 8916,
  //       8917, 8918, 8919,
  //     ],
  //   },
  //   validity: (req, params) => {
  //     return req.query.source != "mturk";
  //   },
  //   function: GetStatementById,
  // },
  // {
  //   // behavior = 1
  //   // everyday = 1
  //   // figure_of_speech = 0
  //   // judgment = 1
  //   // opinion = 1
  //   // reasoning = 1
  //   params: {
  //     ids: [
  //       8920, 8921, 8922, 8923, 8924, 8925, 8926, 8927, 8928, 8929, 8930, 8931,
  //       8932, 8933, 8934,
  //     ],
  //   },
  //   validity: (req, params) => {
  //     return req.query.source != "mturk";
  //   },
  //   function: GetStatementById,
  // },
  // {
  //   // behavior = 0
  //   // everyday = 0
  //   // figure_of_speech = 0
  //   // judgment = 1
  //   // opinion = 1
  //   // reasoning = 0
  //   params: {
  //     ids: [
  //       8935, 8936, 8937, 8938, 8939, 8940, 8941, 8942, 8943, 8944, 8945, 8946,
  //       8947, 8948, 8949,
  //     ],
  //   },
  //   validity: (req, params) => {
  //     return req.query.source != "mturk";
  //   },
  //   function: GetStatementById,
  // },
  // {
  //   // behavior = 0
  //   // everyday = 1
  //   // figure_of_speech = 0
  //   // judgment = 1
  //   // opinion = 0
  //   // reasoning = 0
  //   params: {
  //     ids: [
  //       8950, 8951, 8952, 8953, 8954, 8955, 8956, 8957, 8958, 8959, 8960, 8961,
  //       8962, 8963, 8964,
  //     ],
  //   },
  //   validity: (req, params) => {
  //     return req.query.source != "mturk";
  //   },
  //   function: GetStatementById,
  // },
  // {
  //   // behavior = 0
  //   // everyday = 1
  //   // figure_of_speech = 0
  //   // judgment = 1
  //   // opinion = 1
  //   // reasoning = 0
  //   params: {
  //     ids: [
  //       8996, 8966, 8967, 8968, 8969, 8970, 8971, 8972, 8973, 8974, 8975, 8976,
  //       8977, 8978, 8979,
  //     ],
  //   },
  //   validity: (req, params) => {
  //     return req.query.source != "mturk";
  //   },
  //   function: GetStatementById,
  // },
  // {
  //   // behavior = 1
  //   // everyday = 0
  //   // figure_of_speech = 0
  //   // judgment = 1
  //   // opinion = 1
  //   // reasoning = 1
  //   params: {
  //     ids: [
  //       8980, 8981, 8982, 8983, 8984, 8985, 8986, 8987, 8988, 8989, 8990, 8991,
  //       8992, 8993, 8994,
  //     ],
  //   },
  //   validity: (req, params) => {
  //     return req.query.source != "mturk";
  //   },
  //   function: GetStatementById,
  // },
  // added on 2024-Oct-4
  {
    // behavior = 0 everyday = 1 figure_of_speech = 0 judgment = 0 opinion = 0 reasoning = 0
    params: {
      ids: [
        8997, 8998, 8999, 9000, 9001, 9002, 9003, 9004, 9005, 9006, 9007, 9008,
        9009, 9010, 9011,
      ],
    },
    validity: (req, params) => {
      return req.query.source != "mturk";
    },
    function: GetStatementById,
  },
  {
    // behavior = 0 everyday = 1 figure_of_speech = 0 judgment = 1 opinion = 0 reasoning = 0
    params: {
      ids: [
        9012, 9013, 9014, 9015, 9016, 9017, 9018, 9019, 9020, 9021, 9022, 9023,
        9024, 9025, 9026,
      ],
    },
    validity: (req, params) => {
      return req.query.source != "mturk";
    },
    function: GetStatementById,
  },
  {
    // behavior = 0 everyday = 1 figure_of_speech = 0 judgment = 1 opinion = 1 reasoning = 0
    params: {
      ids: [
        9027, 9028, 9029, 9030, 9031, 9032, 9033, 9034, 9035, 9036, 9037, 9038,
        9039, 9040, 9041,
      ],
    },
    validity: (req, params) => {
      return req.query.source != "mturk";
    },
    function: GetStatementById,
  },
  {
    // behavior = 1 everyday = 0 figure_of_speech = 0 judgment = 1 opinion = 1 reasoning = 0
    params: {
      ids: [
        9042, 9043, 9044, 9045, 9046, 9047, 9048, 9049, 9050, 9051, 9052, 9053,
        9054, 9055, 9056,
      ],
    },
    validity: (req, params) => {
      return req.query.source != "mturk";
    },
    function: GetStatementById,
  },
  {
    // behavior = 1 everyday = 0 figure_of_speech = 0 judgment = 1 opinion = 1 reasoning = 1
    params: {
      ids: [
        9057, 9058, 9059, 9060, 9061, 9062, 9063, 9064, 9065, 9066, 9067, 9068,
        9069, 9070, 9071,
      ],
    },
    validity: (req, params) => {
      return req.query.source != "mturk";
    },
    function: GetStatementById,
  },
  {
    // behavior = 1 everyday = 1 figure_of_speech = 0 judgment = 1 opinion = 0 reasoning = 0
    params: {
      ids: [
        9072, 9073, 9074, 9075, 9076, 9077, 9078, 9079, 9080, 9081, 9082, 9083,
        9084, 9085, 9086,
      ],
    },
    validity: (req, params) => {
      return req.query.source != "mturk";
    },
    function: GetStatementById,
  },
  {
    // behavior = 1 everyday = 1 figure_of_speech = 0 judgment = 1 opinion = 1 reasoning = 0
    params: {
      ids: [
        9087, 9088, 9089, 9090, 9091, 9092, 9093, 9094, 9095, 9096, 9097, 9098,
        9099, 9100, 9101,
      ],
    },
    validity: (req, params) => {
      return req.query.source != "mturk";
    },
    function: GetStatementById,
  },
  {
    // behavior = 1 everyday = 1 figure_of_speech = 0 judgment = 1 opinion = 1 reasoning = 1
    params: {
      ids: [
        9102, 9103, 9104, 9105, 9106, 9107, 9108, 9109, 9110, 9111, 9112, 9113,
        9114, 9115, 9116,
      ],
    },
    validity: (req, params) => {
      return req.query.source != "mturk";
    },
    function: GetStatementById,
  },
];

const experiment = {
  experimentName: "design-point",
  treatments: designPoints,
  treatmentAssigner: async (treatments) => {
    const experiment_count = await FindLeastFrequentFinishedExperiment(
      treatments.map((treatment) => {
        return treatment.params;
      })
    );

    // find treatments with less than 100 completion
    const valid_experiments = experiment_count.filter((t) => t.count < 50);

    // select the least frequent treatment
    if (valid_experiments.length > 0) {
      const selected_treatment = valid_experiments[0].experimentId;
      return treatments.find((treatment) => {
        return stringy(treatment.params) === selected_treatment;
      });
    } else {
      return null;
    }
  },
};

module.exports = experiment;
