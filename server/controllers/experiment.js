const experiments = require("../survey/experiments");
const db = require("../models");
const { sendMetaEvent } = require("./meta");
const {
  createExperiment,
  updateExperiment,
} = require("../survey/experiments/utils/save-experiment");
const {
  saveIndividualDB,
} = require("../survey/experiments/utils/save-individual");
const {
  GetStatementsWeighted,
} = require("../survey/treatments/weighted-random.treatment");
const { validationResult } = require("express-validator");

const { stringy } = require("../survey/treatments/utils/id-generator");

const returnStatements = async (req, res) => {
  const language = req.query.language || "en"; // default to English if no language is provided

  // Check for validation errors in the request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Filter out invalid treatments
  const valid_experiments = experiments
    .flatMap((experiment) =>
      experiment.treatments.map((treatment) => {
        return {
          experiment_name: experiment.experimentName,
          experiment_assigner: experiment.treatmentAssigner,
          validity: () => true,
          ...treatment,
        };
      })
    )
    .filter((treatment) => {
      return treatment.validity({ ...req }, treatment.params);
    });

  // Group valid experiments by experiment name and treatment
  const grouped_experiments = valid_experiments.reduce((acc, experiment) => {
    if (!acc[experiment.experiment_name]) {
      acc[experiment.experiment_name] = {
        experiment_assigner: experiment.experiment_assigner,
        experiment_valid_treatments: [],
      };
    }
    acc[experiment.experiment_name].experiment_valid_treatments.push(
      experiment
    );
    return acc;
  }, {});

  // Ensure async operations are handled correctly
  for (const experiment_name of Object.keys(grouped_experiments)) {
    const experiment = grouped_experiments[experiment_name];
    const assigned_treatment = await experiment.experiment_assigner(
      experiment.experiment_valid_treatments,
      req
    );

    // If a treatment was assigned, add it to the experiment
    if (assigned_treatment) {
      // Assign the treatment to the experiment
      grouped_experiments[experiment_name].assigned_treatment =
        assigned_treatment;
    } else {
      // Remove the experiment if no treatment was assigned
      delete grouped_experiments[experiment_name];
    }
  }

  // 1. Check for an existing unfinished experiment for this session
  const user_session_id = req.query.sessionId;
  try {
    const unfinishedExperiment = await db.experiments.findOne({
      where: {
        userSessionId: user_session_id,
        finished: false,
      },
      order: [["createdAt", "DESC"]], // Get the most recent one
    });

    if (unfinishedExperiment) {
      console.log("Found unfinished experiment for session:", user_session_id);

      // Fetch all answers submitted after this experiment started
      const experimentAnswers = await db.answers.findAll({
        where: {
          sessionId: user_session_id,
          createdAt: {
            [db.Sequelize.Op.gte]: unfinishedExperiment.createdAt,
          },
        },
      });

      // Merge answers into the statement list
      const statementsWithAnswers = unfinishedExperiment.statementList.map(
        (statement) => {
          const answersForThisStatement = experimentAnswers.filter(
            (ans) => ans.statementId === statement.id
          );

          // If we found any answers, we consider it "answereSaved"
          // We can also populate the answer array if the frontend needs it
          // Note: The frontend expects an `answers` array matching the questionData length
          // Here we just mark it saved; the frontend can still use localStorage for the actual values if it wants
          // but marking it saved in the backend-driven list is the key for step calculation.
          return {
            ...statement,
            answereSaved: answersForThisStatement.length > 0,
            // If you want to merge actual column data, you'd need the question mapping here too
            // For now, setting answereSaved based on backend truth is the primary requirement.
          };
        }
      );

      return res.json({
        statements: statementsWithAnswers,
        experimentId: unfinishedExperiment.id,
        experimentType: unfinishedExperiment.experimentType,
        isResumed: true,
      });
    }
  } catch (error) {
    console.error("Error checking for unfinished experiment:", error);
    // Continue with creating a new one if lookup fails
  }

  // Define random_experiment variable
  let random_experiment = {};

  // if grouped_experiments is empty, asign a default treatment
  if (Object.keys(grouped_experiments).length === 0) {
    random_experiment = {
      assigned_treatment: {
        experiment_name: "default",
        params: {
          sessionId: user_session_id,
          validStatementList: [],
          numberOfStatements: 15,
        },
        function: GetStatementsWeighted,
        validity: (req, params) => {
          return true;
        },
      },
    };
  } else {
    // Select a random experiment from grouped_experiments
    const experiment_names = Object.keys(grouped_experiments);
    const random_experiment_name =
      experiment_names[Math.floor(Math.random() * experiment_names.length)];
    random_experiment = grouped_experiments[random_experiment_name];
  }

  const result = await random_experiment.assigned_treatment.function({
    ...random_experiment.assigned_treatment.params,
    language,
    sessionId: user_session_id, // Ensure sessionId is passed for deterministic shuffle
  });

  // Remove sessionId from req.query
  delete req.query.sessionId;

  const experimentData = {
    userSessionId: user_session_id,
    experimentId: stringy(random_experiment.assigned_treatment.params),
    experimentType: random_experiment.assigned_treatment.experiment_name,
    experimentInfo: random_experiment.assigned_treatment,
    statementList: result.answer,
    urlParams: stringy(req.query) ? stringy(req.query) : null,
    finished: false,
  };

  try {
    const experiment = await createExperiment(experimentData);
    res.json({
      statements: result.answer,
      experimentId: experiment.id,
      experimentType: experiment.experimentType,
    });
  } catch (error) {
    console.error("Error creating experiment:", error);
    return res.status(500).json({ error: "Failed to create experiment" });
  }
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
  const fbp = req.cookies._fbp || undefined;
  const fbc = req.cookies._fbc || undefined;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const experimentId = req.body.experimentId;

  // Determine IP and user agent
  const clientIp =
    req.session?.ip ||
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress;
  const userAgent = req.headers["user-agent"];
  const eventSourceUrl = req.headers.referer || req.body.eventSourceUrl;

  try {
    await updateExperiment(experimentId, { finished: true });
    console.log("Experiment saved:", experimentId);

    // Send Meta CAPI event
    const result = await sendMetaEvent({
      eventName: "SurveyCompleted",
      fbp,
      fbc,
      eventId: experimentId,
      clientIp,
      userAgent,
      eventSourceUrl,
    });

    console.log("Meta event result:", result);
    res.json({ ok: true });
  } catch (error) {
    console.error("Error saving experiment or sending event:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  returnStatements,
  saveIndividual,
  saveExperiment,
};
