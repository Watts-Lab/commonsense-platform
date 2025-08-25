const { Op } = require("sequelize");
const { GetStatementById } = require("../treatments/statement-by-id.treatment");
const {
  dailyexperiment,
  experiments,
  statements,
  answers,
  sequelize,
} = require("../../models");

// helper: pick or generate daily experiment
async function getOrCreateDailyExperiment() {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // check if one exists
  let daily = await dailyexperiment.findByPk(today);
  if (daily) {
    return daily.statementIds;
  }

  const results = await statements.findAll({
    attributes: [
      ["id", "statementId"],
      "statement",
      [sequelize.fn("COUNT", sequelize.col("answers.id")), "answerCount"],
    ],
    include: [
      {
        model: answers,
        as: "answers",
        attributes: [],
        required: false,
      },
    ],
    group: ["statements.id", "statements.statement"],
    order: [[sequelize.literal("answerCount"), "ASC"]],
    limit: 15,
  });

  const lowestRatedStatements = results.map((r) => r.statementId);

  // save it
  daily = await dailyexperiment.create({
    date: today,
    statementIds: lowestRatedStatements,
  });

  return daily.statementIds;
}

const newdailyexperiment = {
  experimentName: "daily-experiment",
  treatments: [
    {
      params: {}, // will be filled dynamically by treatmentAssigner
      function: GetStatementById,
      validity: () => true, // all users are eligible unless filtered later
    },
  ],
  treatmentAssigner: async (treatments, req) => {
    const sessionId = req.query.sessionId;
    if (!sessionId) return null;

    const today = new Date().toISOString().slice(0, 10);

    // check if this user already finished today’s daily experiment
    const alreadyDone = await experiments.findOne({
      where: {
        userSessionId: sessionId,
        experimentType: "daily-experiment",
        finished: true,
        createdAt: {
          [Op.gte]: new Date(today + "T00:00:00.000Z"),
          [Op.lte]: new Date(today + "T23:59:59.999Z"),
        },
      },
    });

    if (alreadyDone) {
      return null; // user already did it -> controller will skip this experiment
    }

    // otherwise, get or create today’s statements
    const statementIds = await getOrCreateDailyExperiment();

    return {
      ...treatments[0],
      params: {
        ids: statementIds,
      },
    };
  },
};

module.exports = newdailyexperiment;
