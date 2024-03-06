const { experiments, sequelize } = require("../../../models");

const findExprimentCount = async () => {
  
    try {
    const experimentCounts = await experiments.findAll({
      attributes: [
        "experimentId",
        [sequelize.fn("COUNT", sequelize.col("experimentId")), "count"],
      ],
      group: ["experimentId"], // Group by 'experimentId' to get counts for each unique value
      raw: true, // Ensure the raw result for easier manipulation
      // If you need to filter only finished or a certain type of experiments, you can include a 'where' clause here.
    });

    console.table(experimentCounts); // This will log the counts in a table format for better readability
  } catch (error) {
    console.error("Error counting unique experimentIds:", error);
  }
  //   let lowestCount = Infinity;
  //   let lowestTreatment = null;

  //   for (const treatment of experimentCount) {
  //     if (treatment.count < lowestCount) {
  //       lowestCount = treatment.count;
  //       lowestTreatment = treatment;
  //     }
  //   }
};

module.exports = { findExprimentCount };
