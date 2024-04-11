const { FindExperimentCount } = require("./find-experiment-count");
const { stringy } = require("../../treatments/utils/id-generator");

const FindLeastFrequentExperiment = async (params) => {
  experimentIds = params.map((treatment) => {
    return stringy(treatment);
  });

  const experimentCounts = await FindExperimentCount(experimentIds);

  experimentCounts.sort((a, b) => a.count - b.count);

  if (experimentCounts.length > 0) {
    return experimentCounts[0].experimentId;
  } else {
    console.log("No experiments found.");
    return 0;
  }
};

module.exports = { FindLeastFrequentExperiment };
