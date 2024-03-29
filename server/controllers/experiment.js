const experiments = require("../survey/experiments");
const { stringy } = require("../survey/treatments/utils/id-generator");
const {
  saveExperiment,
} = require("../survey/experiments/utils/save-experiment");
const {
  FindLeastFrequentExperiment,
} = require("../survey/experiments/utils/reverse-weight-selector");

const returnStatements = async (req, res) => {
  const oursobject = experiments
    .flatMap((experiment) =>
      experiment.treatments.map((treatment) => {
        return {
          validity: () => true,
          req: { ...req.body },
          ...experiment,
          ...treatment,
        };
      })
    )
    .filter((treatment) => treatment.validity({ ...req }));

  console.log(oursobject);
  const selectedTreatment = await FindLeastFrequentExperiment(
    oursobject.map((treatment) => {
      return treatment.params;
    })
  ).then((selectedTreatmentParam) => {
    return oursobject.find((treatment) => {
      return stringy(treatment.params) === selectedTreatmentParam;
    });
  });

  const result = await selectedTreatment.function(selectedTreatment.params);

  const experimentData = {
    userSessionId: req.sessionID,
    experimentId: stringy(selectedTreatment.params),
    experimentType: selectedTreatment.experimentName,
    experimentInfo: selectedTreatment.params,
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

  res.json({ value: result.answer });
};

module.exports = {
  returnStatements,
};
