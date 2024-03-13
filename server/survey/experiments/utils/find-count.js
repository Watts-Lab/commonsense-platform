const { experiments, sequelize } = require("../../../models");

const findExprimentCount = async () => {
  
    try {
    const experimentCounts = await experiments.findAll({
      attributes: [
        "experimentId",
        [sequelize.fn("COUNT", sequelize.col("experimentId")), "count"],
      ],
      group: ["experimentId"],
      raw: true,
    });

    console.table(experimentCounts); 
  } catch (error) {
    console.error("Error counting unique experimentIds:", error);
  }

};

module.exports = { findExprimentCount };
