const fs = require("fs");
const path = require("path");

const treatmentFiles = fs
  .readdirSync(__dirname)
  .filter((file) => file !== "treatment-factory.js" && file.endsWith(".js"));

const treatments = {};

treatmentFiles.forEach((file) => {
  const treatmentName = path.basename(file, ".js");
  treatments[treatmentName] = require(`./${file}`);
});

module.exports = treatments;
