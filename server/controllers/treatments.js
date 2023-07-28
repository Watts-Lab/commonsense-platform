const {
  statements,
  treatments,
  usertreatments,
  sequelize,
} = require("../models");
const { Sequelize, QueryTypes } = require("sequelize");
const Op = Sequelize.Op;

const process = require("process");
require("dotenv").config();
const { getStatementFromList } = require("./statements");
const manifest = require("../survey/manifest");
const { createDiffieHellmanGroup } = require("crypto");

const userGenerators = {};

async function getAllStatements(params) {
  try {
    const statementList = await statements.findAll({
      attributes: ["id", "statement"],
      order: Sequelize.literal("rand()"),
      limit: params.limit,
    });

    // console.log("Statement List:", statementList);
    return statementList;
  } catch (error) {
    // Handle any errors that occur during the database query
    console.error("Error fetching statements:", error);
    throw error;
  }
}

// reading the manifest file from the survey folder
const manifest_treatments = manifest.treatments;
const manifest_assignment = manifest.assignment;

async function getAllTreatments() {
  try {
    for (const treatment of manifest_treatments) {
      const existingTreatment = await treatments.findOne({
        where: { id: treatment.id },
      });

      if (!existingTreatment) {
        console.log(
          "Treatment not found in the database",
          treatment.id,
          "adding..."
        );

        // Treatment not found in the database, add a new record
        await treatments.create({
          id: treatment.id,
          code: treatment.id,
          description: treatment.description,
          params: JSON.stringify(treatment),
        });
      }
    }
  } catch (error) {
    console.error("Error fetching treatments:", error);
    throw error;
  }

  // console.log("treatments: ", await treatments.findAll());
}

// controller for getting the treatment path /treatments/all
const readTreatments = async (req, res, next) => {
  console.log(manifest_treatments[9]);
  const assignedTreatment = manifest_treatments[9];

  res.send(
    await assignedTreatment.statements(assignedTreatment.statements_params)
  );
};

const chooseTreatment = async (req_param) => {
  const treatmentIds =
    req_param.query.source === "facebook" ||
    req_param.query.source === "instagram"
      ? [1, 2, 3]
      : [4, 5, 6, 7, 8, 9, 10, 11];

  const treatmentCount = await treatments
    .findAll({
      attributes: [
        "id",
        [
          sequelize.fn("COUNT", sequelize.col("usertreatments.treatmentId")),
          "count",
        ],
      ],
      where: { id: treatmentIds },
      include: [
        {
          model: usertreatments,
          attributes: [],
          where: { treatmentId: treatmentIds }, // Filter by specific treatmentIds
          required: false,
        },
      ],
      group: ["treatments.id"],
    })
    .then((treatmentCount) => {
      return treatmentCount.map((treatment) => treatment.dataValues);
    });

  let lowestCount = Infinity;
  let lowestTreatment = null;

  for (const treatment of treatmentCount) {
    if (treatment.count < lowestCount) {
      lowestCount = treatment.count;
      lowestTreatment = treatment;
    }
  }

  const assignedTreatment = manifest_treatments[lowestTreatment.id - 1];

  const treatment_parameters = {
    ...assignedTreatment.statements_params,
    ...req_param.query,
    sessionId: req_param.sessionID,
  };

  console.log("treatment parameters", treatment_parameters);

  let statements =
    typeof assignedTreatment.statements === "function"
      ? await assignedTreatment.statements(treatment_parameters)
      : assignedTreatment.statements;

  assignedTreatment.statements = statements;

  return assignedTreatment;
};

// controller for getting the treatment path /treatments
const getTreatment = async (req, res, next) => {
  const source = Object.keys(req.query)
    .map(
      (key) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(req.query[key])}`
    )
    .join("&");

  if (req.query.source) {
    console.log("source", req.query.source);
  }

  // 5, 10, 15, 20, 25, 30, 35, 40;
  //   ? roundRobin(fb_1, fb_2, fb_3) : randomWeight(point_1, point_2, point_3)

  let user = await usertreatments.findOne({
    where: { sessionId: req.sessionID, finished: false },
  });

  if (!user) {
    let treatment = await chooseTreatment(req);

    console.log("treatment", treatment);

    await usertreatments
      .create({
        sessionId: req.sessionID,
        treatmentId: treatment.id,
        statementList: JSON.stringify(treatment.statements),
        finished: false,
        urlParams: source === "" ? null : source,
      })
      .then((statements) => {
        res.send({ value: treatment.statements });
      });
  } else {
    res.send({ value: JSON.parse(user.statementList) });
  }
};

const updateTreatment = async (req, res, next) => {
  const user = await usertreatments
    .findOne({
      where: { sessionId: req.sessionID, finished: false },
    })
    .then((user) => {
      if (user) {
        user.update({ finished: true });
      } else {
        console.log("user not found");
      }
    })
    .then(() => {
      res.send({ value: "success" });
    });
};

module.exports = {
  getTreatment,
  readTreatments,
  getAllTreatments,
  updateTreatment,
};
