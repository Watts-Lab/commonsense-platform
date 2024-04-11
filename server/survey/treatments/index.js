const fs = require("fs");
const path = require("path");

let treatments = {};

fs.readdirSync(__dirname).forEach((file) => {
  if (file !== "index.js" && file.endsWith(".js")) {
    const moduleName = path.basename(file, ".js");
    const moduleFunction = require(`./${file}`);
    treatments = { ...treatments, ...moduleFunction };
  }
});

module.exports = treatments;
