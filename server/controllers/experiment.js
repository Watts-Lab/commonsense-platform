const experiments = require("../survey/experiments");
const { stringy } = require("../survey/treatments/utils/id-generator");
const { saveExperiment } = require("../survey/experiments/utils/save-experiment");

const returnStatements = async (req, res) => {
  const SelectorFunction = experiments[0].treatmentSelector;
  const selectedTreatment = await SelectorFunction(
    experiments[0].treatments.map((treatment) => {
      return treatment.params;
    })
  );

  let resolvedExperiment;
  experiments[0].treatments.forEach((treatment) => {
    if (stringy(treatment.params) === selectedTreatment) {
      resolvedExperiment = treatment;
    }
  });

  const result = await resolvedExperiment.function(resolvedExperiment.params);

  const experimentData = {
    userSessionId: req.sessionID,
    experimentId: stringy(resolvedExperiment.params),
    experimentType: experiments[0].name,
    experimentInfo: resolvedExperiment.params,
    statementList: result.answer,
    urlParams: req.query.source ? req.query.source : null,
    finished: false,
  };

  saveExperiment(experimentData)
    .then((newExperiment) => {
      console.log("Experiment saved:", newExperiment.id);
    })
    .catch((error) => {
      console.error("Error saving experiment:", error);
    });

  res.json(result.answer);
};

module.exports = {
  returnStatements,
};
