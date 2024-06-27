const experiments = require("../survey/experiments");
const {
  saveExperiment,
} = require("../survey/experiments/utils/save-experiment");
const {
  saveIndividualDB,
} = require("../survey/experiments/utils/save-individual");
const {
  FindLeastFrequentExperiment,
} = require("../survey/experiments/utils/reverse-weight-selector");

const { stringy } = require("../survey/treatments/utils/id-generator");
const { statements_subset, Sequelize } = require("../models");
const {
  GetStatementByLanguage,
} = require("../survey/treatments/statement-by-language.treatment");

const returnStatements = async (req, res) => {
  const language = req.query.language || "en"; // default to English if no language is able to be specified

  const oursobject = experiments
    .flatMap((experiment) =>
      experiment.treatments.map((treatment) => {
        return {
          validity: () => true,
          req: { ...req.body },
          ...experiment,
          ...treatment,
          params: { ...treatment.params, language }, // add language to params
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

  const result = await treatmentObject.function({
    ...treatmentObject.params,
    ...treatmentObject.req,
  });

  const experimentData = {
    userSessionId: req.sessionID,
    experimentId: stringy(treatmentObject.params),
    experimentType: treatmentObject.experimentName,
    experimentInfo: treatmentObject,
    statementList: result.answer,
    urlParams: stringy(req.query) ? stringy(req.query) : null,
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

const saveIndividual = async (req, res) => {
  const individualData = {
    userSessionId: req.sessionID,
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

const getStatementsForTest = async (language) => {
  try {
    const params = { language };
    const result = await GetStatementByLanguage(params);
    return result.answer;
  } catch (error) {
    console.error("Error fetching statements:", error);
    throw error;
  }
};

const testStatements = async (req, res) => {
  try {
    const language = req.query.language || "en";
    const statements = await getStatementsForTest(language);
    res.json({ statements });
  } catch (error) {
    res
      .status(500)
      .json({ error: "an error occurred while fetching test statements" });
  }
};

module.exports = {
  returnStatements,
  saveIndividual,
  testStatements,
};
