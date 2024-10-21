const {
  FindExperimentCount,
  FindExperimentFinishedCount,
} = require("./find-experiment-count");
const { stringy } = require("../../treatments/utils/id-generator");

/**
 * Find the least frequent experiment in the database.
 *
 * @param {Array} params - An array of treatment parameters.
 * @returns {Promise<number>} - A promise that resolves to the experiment ID with the least frequency.
 */

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

const FindLeastFrequentFinishedExperiment = async (params) => {
  const experimentIds = params.map((treatment) => stringy(treatment));
  let experimentCounts;

  try {
    experimentCounts = await FindExperimentFinishedCount(experimentIds);
  } catch (error) {
    console.error("Error fetching experiment counts:", error);
    experimentCounts = [];
  }

  if (experimentCounts && experimentCounts.length > 0) {
    return experimentCounts.sort((a, b) => a.count - b.count);
  } else {
    console.log("No experiments found.");
    return 0;
  }
};

module.exports = {
  FindLeastFrequentExperiment,
  FindLeastFrequentFinishedExperiment,
};
