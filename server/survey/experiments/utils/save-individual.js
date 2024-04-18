const { individual, sequelize } = require("../../../models");

async function saveIndividualDB(individualData) {
  try {
    const newIndividual = await individual.create(individualData);

    return newIndividual;
  } catch (error) {
    // Handle any errors that occur during the saving process
    console.error("Error saving individual:", error);
    throw error;
  }
}

module.exports = {
    saveIndividualDB,
};
