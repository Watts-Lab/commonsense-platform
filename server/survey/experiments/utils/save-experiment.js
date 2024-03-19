const { experiments, sequelize } = require("../../../models");

async function saveExperiment(experimentData) {
  try {
    const newExperiment = await experiments.create(experimentData);

    return newExperiment;
  } catch (error) {
    // Handle any errors that occur during the saving process
    console.error("Error saving experiment:", error);
    throw error;
  }
}

module.exports = {
  saveExperiment,
};
