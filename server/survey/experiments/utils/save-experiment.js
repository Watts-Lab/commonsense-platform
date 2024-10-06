const { experiments, sequelize } = require("../../../models");

// Create a new experiment
async function createExperiment(experimentData) {
  try {
    const newExperiment = await experiments.create(experimentData);
    console.log("Experiment created:", newExperiment.id);
    return newExperiment;
  } catch (error) {
    // Handle any errors that occur during the saving process
    console.error("Error saving experiment:", error);
    throw error;
  }
}

// Update an existing experiment with new data
async function updateExperiment(experimentId, experimentData) {
  try {
    const updatedExperiment = await experiments.update(experimentData, {
      where: {
        id: experimentId,
      },
    });

    return updatedExperiment;
  } catch (error) {
    // Handle any errors that occur during the updating process
    console.error("Error updating experiment:", error);
    throw error;
  }
}

module.exports = {
  createExperiment,
  updateExperiment,
};
