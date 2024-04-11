const { experiments, sequelize } = require("../../../models");

const { Op } = require("sequelize");

const FindExperimentCount = async (experimentIds) => {
  try {
    // Filter records with experimentIds included in the passed array
    const experimentCounts = await experiments.findAll({
      where: {
        experimentId: {
          [Op.in]: experimentIds,
        },
      },
      attributes: [
        "experimentId",
        [sequelize.fn("COUNT", sequelize.col("experimentId")), "count"],
      ],
      group: ["experimentId"],
      raw: true,
    });

    // Post-process to ensure all experimentIds are accounted for
    const countsMap = experimentCounts.reduce(
      (acc, { experimentId, count }) => {
        acc[experimentId] = count;
        return acc;
      },
      {}
    );

    const allCounts = experimentIds.map((id) => ({
      experimentId: id,
      count: countsMap[id] || 0,
    }));

    return allCounts;
  } catch (error) {
    console.error("Error counting unique experimentIds:", error);
  }
};

module.exports = { FindExperimentCount };
