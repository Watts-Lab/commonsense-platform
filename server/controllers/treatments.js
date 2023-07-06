const { statements, usertreatments } = require("../models");
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

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

function* generator_prototype_for_fixed_15(sessionId, statements_array) {
  const statements = shuffle(statements_array);
  console.log("sessionId inside generator", sessionId);

  // Return two items at the beginning
  yield [statements[0], statements[1], statements[2], statements[3], statements[4], statements[5], statements[6], statements[7], statements[8], statements[9], statements[10], statements[11], statements[12], statements[13], statements[14]];


  // Return remaining items one by one
  for (let i = 14; i < statements.length; i++) {
    yield statements[i];
  }
}

// reading the manifest file from the survey folder
const treatments = manifest.treatments;
const assignment = manifest.assignment;

// getting the treatment from the manifest file by assignment and returning statements
const readTreatments = async (req, res, next) => {
  // Execute the assignment callback function

  res.send(await getAllStatements({ limit: 15}));
  
};

const chooseTreatment = () => {
  if (typeof assignment === "function") {
    const assignedTreatment = assignment(treatments);
    let statements =
      typeof assignedTreatment.statements === "function"
        ? assignedTreatment.statements(assignedTreatment.statements_params)
        : assignedTreatment.statements;
    return assignedTreatment;
  } else {
    return assignment;
  }
};

const getTreatment = async (req, res, next) => {
  let user = await usertreatments.findOne({
    where: { sessionId: req.sessionID },
  });

  if (!user) {
    let treatment = chooseTreatment();

    await usertreatments
      .create({
        sessionId: req.sessionID,
        treatmentId: treatment.id,
        statementList: JSON.stringify(treatment.statements),
      })
      .then((statements) => {
        if (!userGenerators[req.sessionID]) {
          userGenerators[req.sessionID] = generator_prototype_for_fixed_15(
            req.sessionID,
            treatment.statements
          );
          console.log(`1. Generator created for user ${req.sessionID}`);
        }
      })
      .then(() => {
        if (userGenerators[req.sessionID]) {
          res.send(userGenerators[req.sessionID].next());
        }
      });
  } else {
    if (userGenerators[req.sessionID]) {
      console.log('%cThis is a different colored message', 'color: green; background-color: yellow; font-weight: bold;');
      res.send(userGenerators[req.sessionID].next());
    } else {
      userGenerators[req.sessionID] = generator_prototype_for_fixed_15(
        req.sessionID,
        JSON.parse(user.statementList)
      );
      console.log(`2. Generator created for user ${req.sessionID}`);
      res.send(userGenerators[req.sessionID].next());
    }
  }
};

module.exports = { getTreatment, readTreatments };
