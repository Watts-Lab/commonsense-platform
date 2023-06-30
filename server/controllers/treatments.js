const process = require("process");
require("dotenv").config();

const manifest = require("../survey/manifest");

// You can access the properties of the manifest object like this:
const treatments = manifest.treatments;
const assignment = manifest.assignment;

// Further code logic...

const readTreatments = () => {
  // Iterate over the treatments and execute the callback functions
  treatments.forEach((treatment) => {
    const statements =
      typeof treatment.statements === "function"
        ? treatment.statements()
        : treatment.statements;
    console.log("Statements:", statements);
  });

  // Execute the assignment callback function
  if (typeof assignment === "function") {
    const assignedTreatment = assignment(treatments);
    console.log("Assigned Treatment:", assignedTreatment);
    const statements =
      typeof assignedTreatment.statements === "function"
        ? assignedTreatment.statements()
        : assignedTreatment.statements;
    assignedTreatment.statements = statements;
    return assignedTreatment;
  } else {
    console.log("Assignment Method:", assignment);
    return assignment;
  }


  
};

module.exports = { readTreatments };
