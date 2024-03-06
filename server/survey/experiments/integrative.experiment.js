const { experiments } = require("../../models");
const { findExprimentCount } = require("./utils/find-count");

const integrativeExperiment = [
  {
    name: "design point [1, 0, 0, 1, 1, 1]",
    description:
      "This design point has 4 features behavior, judgment, opinion, and reasoning.",
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
    required: true,
    numberOfParticipants: 100,
  },

  {
    name: "design point [1, 0, 0, 0, 1, 1]",
    description:
      "This design point has 3 features behavior, opinion, and reasoning.",
    randomSeed: 13,
    numberOfStatements: 15,
    desingPointParams: {
      behavior: 1,
      everyday: 0,
      figure_of_speech: 0,
      judgment: 0,
      opinion: 1,
      reasoning: 1,
    },
    required: true,
    numberOfParticipants: 100,
  },

  {
    name: "design point [1, 1, 0, 1, 1, 1]",
    description:
      "This design point has 5 features behavior, everyday, judgment, opinion, and reasoning.",
    randomSeed: 13,
    numberOfStatements: 15,
    desingPointParams: {
      behavior: 1,
      everyday: 1,
      figure_of_speech: 0,
      judgment: 1,
      opinion: 1,
      reasoning: 1,
    },
    required: true,
    numberOfParticipants: 100,
  },
];

const getExperiment = async () => {
  return await findExprimentCount();
};

module.exports = { getExperiment };
