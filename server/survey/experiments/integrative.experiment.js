const { experiments } = require("../../models");
const { findExprimentCount } = require("./utils/find-count");

const integrativeExperiment = [
  {
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
    numberOfParticipants: 100,
  },
  {
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
    numberOfParticipants: 100,
  },
  {
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
    numberOfParticipants: 100,
  },
];

const getExperiment = async () => {
  return await findExprimentCount();
};

module.exports = { getExperiment };
