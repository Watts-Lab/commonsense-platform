const process = require("process");
require("dotenv").config();
const { getStatementFromList } = require("./statements.js");
const manifest = require("../survey/manifest");

// reading the manifest file from the survey folder
const treatments = manifest.treatments;
const assignment = manifest.assignment;

// getting the treatment from the manifest file by assignment and returning statements
const readTreatments = () => {
  // Execute the assignment callback function
  if (typeof assignment === "function") {
    const assignedTreatment = assignment(treatments);
    console.log("Assigned Treatment:", assignedTreatment);
    let statements =
      typeof assignedTreatment.statements === "function"
        ? assignedTreatment.statements(assignedTreatment.statements_params)
        : getStatementFromList(assignedTreatment.statements);
    assignedTreatment.statements = statements;
    return statements;
  } else {
    console.log("Assignment Method:", assignment);
    return assignment;
  }
};

module.exports = { readTreatments };
