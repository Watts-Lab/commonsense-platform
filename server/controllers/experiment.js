const experiments = require("../survey/experiments");
const {
  saveExperiment,
} = require("../survey/experiments/utils/save-experiment");
const {
  FindLeastFrequentExperiment,
} = require("../survey/experiments/utils/reverse-weight-selector");

const { stringy } = require("../survey/treatments/utils/id-generator");

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

  const groupedExperiments = oursobject.reduce((acc, experiment) => {
    const experimentName = experiment.experimentName;
    if (!acc[experimentName]) {
      acc[experimentName] = [];
    }
    acc[experimentName].push(experiment);
    return acc;
  }, {});

  console.log("groupedExperiments", groupedExperiments);

  const selectedTreatment = await FindLeastFrequentExperiment(
    oursobject.map((treatment) => {
      return treatment.params;
    })
  );

  const treatmentObject = oursobject.find((treatment) => {
    return stringy(treatment.params) === selectedTreatment;
  });

  const result = await treatmentObject.function(treatmentObject.params);

  console.log("result", treatmentObject);

  const experimentData = {
    userSessionId: req.sessionID,
    experimentId: stringy(treatmentObject.params),
    experimentType: treatmentObject.experimentName,
    experimentInfo: treatmentObject,
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

  res.json({ statements: result.answer });
};

module.exports = {
  returnStatements,
};
