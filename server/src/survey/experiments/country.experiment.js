const { GetStatementById } = require("../treatments/statement-by-id.treatment");
const { Op } = require("sequelize");
const { stringy } = require("../treatments/utils/id-generator");
const db = require("../../models");

// Completed bundles a block collects before we advance to the next.
const BLOCK_QUOTA = 10;

// Grace period after which an unfinished survey is treated as abandoned and its
// reserved slot freed (survey takes ~10-15 min, so 30 min is a safe margin).
const INFLIGHT_TTL_MS = 30 * 60 * 1000;

// Live reservations for a block: unfinished experiments sharing its experimentId
// within the TTL. Uses the indexed experiments table; experimentType guards
// against an id collision with another experiment (design-point also uses {ids}).
async function countInFlight(statementIds) {
  const experimentId = stringy({ ids: statementIds });
  return db.experiments.count({
    where: {
      experimentType: "country-bundle",
      experimentId,
      finished: false,
      createdAt: { [Op.gte]: new Date(Date.now() - INFLIGHT_TTL_MS) },
    },
  });
}

// Normalise the `tc` URL param (BeSample country) into a zero-padded ISO 3166-1
// numeric code, e.g. "76" -> "076". Returns null if absent.
function resolveCountryCode(req) {
  const tc = req && req.query ? req.query.tc : undefined;
  if (tc === undefined || tc === null || tc === "") return null;
  return String(tc).trim().padStart(3, "0");
}

// Serve the lowest-numbered enabled block whose completed + in-flight count is
// under quota; null if all are full (country done -> controller uses default).
async function pickBlock(code) {
  if (!code) return null;

  // Enabled blocks not yet completed to quota (~5 per country), lowest first.
  const candidates = await db.countryblock.findAll({
    where: {
      countryCode: code,
      enabled: true,
      completedCount: { [Op.lt]: BLOCK_QUOTA },
    },
    order: [["block", "ASC"]],
  });

  for (const block of candidates) {
    const inFlight = await countInFlight(block.statementIds);
    if (block.completedCount + inFlight < BLOCK_QUOTA) {
      return block;
    }
  }

  // Every candidate is full once in-flight reservations are counted.
  return null;
}

const experiment = {
  experimentName: "country-bundle",

  // Highest priority wins; country-targeted participants must always get their
  // country's bundle over the default (0) or other experiments.
  priority: 100,

  // Cheap sync eligibility gate (just "has a tc code?"); the real check (country
  // configured with open blocks) happens in treatmentAssigner via pickBlock.
  treatments: [
    {
      params: {},
      function: GetStatementById,
      validity: (req) => resolveCountryCode(req) !== null,
    },
  ],

  treatmentAssigner: async (validTreatments, req) => {
    const code = resolveCountryCode(req);

    // Carry the controller-injected metadata (experiment_name/assigner) onto the
    // picked block so the created row is typed "country-bundle".
    const gateway = (validTreatments && validTreatments[0]) || {};
    const { params: _ignored, ...gatewayMeta } = gateway;

    const block = await pickBlock(code);
    if (!block) return null;

    // Telemetry only (started vs completed); selection uses completedCount,
    // bumped on finish in saveExperiment. Atomic for concurrent assignments.
    await block.increment("assignedCount");

    return {
      ...gatewayMeta,
      country: block.country,
      block: block.block,
      countryBlockId: block.id,
      params: { ids: block.statementIds },
      function: GetStatementById,
    };
  },
};

module.exports = experiment;
