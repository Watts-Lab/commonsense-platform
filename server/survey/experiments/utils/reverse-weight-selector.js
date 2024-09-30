const { FindExperimentCount } = require("./find-experiment-count");
const { stringy } = require("../../treatments/utils/id-generator");

const FindLeastFrequentExperiment = async (params) => {
  const experimentIds = params.map((treatment) => stringy(treatment));
  let experimentCounts;

  try {
    experimentCounts = await FindExperimentCount(experimentIds);
  } catch (error) {
    console.error("Error fetching experiment counts:", error);
    experimentCounts = [];
  }

  if (experimentCounts && experimentCounts.length > 0) {
    experimentCounts.sort((a, b) => a.count - b.count);
    return experimentCounts[0].experimentId;
  } else {
    console.log("No experiments found.");
    return 0;
  }
};

module.exports = { FindLeastFrequentExperiment };
