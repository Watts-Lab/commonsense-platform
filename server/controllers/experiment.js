const experiments = require("../survey/experiments");
const {
  createExperiment,
  updateExperiment,
} = require("../survey/experiments/utils/save-experiment");
const {
  saveIndividualDB,
} = require("../survey/experiments/utils/save-individual");
const {
  FindLeastFrequentExperiment,
} = require("../survey/experiments/utils/reverse-weight-selector");
const { body, query, validationResult } = require("express-validator");

const { stringy } = require("../survey/treatments/utils/id-generator");

const returnStatements = async (req, res) => {
  // Check for validation errors in the request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

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

  const selectedTreatment = await FindLeastFrequentExperiment(
    oursobject.map((treatment) => {
      return treatment.params;
    })
  );

  const treatmentObject = oursobject.find((treatment) => {
    return stringy(treatment.params) === selectedTreatment;
  });

  const result = await treatmentObject.function(treatmentObject.params);

  const userSessionId = req.query.sessionId;

  // Remove sessionId from req.query
  delete req.query.sessionId;

  const experimentData = {
    userSessionId: userSessionId,
    experimentId: stringy(treatmentObject.params),
    experimentType: treatmentObject.experimentName,
    experimentInfo: treatmentObject,
    statementList: result.answer,
    urlParams: stringy(req.query) ? stringy(req.query) : null,
    finished: false,
  };

  const experiment = await createExperiment(experimentData);

  res.json({ statements: result.answer, experimentId: experiment.id });
};

const saveIndividual = async (req, res) => {
  const individualData = {
    userSessionId: req.body.sessionId,
    informationType: req.body.informationType,
    experimentInfo: req.body.experimentInfo,
    urlParams: req.query.source ? req.query.source : null,
    finished: true,
  };

  saveIndividualDB(individualData)
    .then((newIndividual) => {
      console.log("Individual saved:", newIndividual.id);
    })
    .catch((error) => {
      console.error("Error saving individual:", error);
    });

  res.json({ ok: true });
};

const saveExperiment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const experimentId = req.body.experimentId;

  updateExperiment(experimentId, { finished: true })
    .then((updatedExperiment) => {
      console.log("Experiment saved:", updatedExperiment.id);
    })
    .catch((error) => {
      console.error("Error saving experiment:", error);
    });

  res.json({ ok: true });
};

module.exports = {
  returnStatements,
  saveIndividual,
  saveExperiment,
};
