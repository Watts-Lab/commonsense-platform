const { GetStatementById } = require("../treatments/statement-by-id.treatment");
const db = require("../../models");

/**
 * Normalise the `tc` URL parameter into a zero-padded ISO 3166-1 numeric code.
 * `tc` is the participant's country, passed by BeSample (e.g. "818", or "76"
 * which we pad to "076").
 *
 * @param {Object} req - Express request (or a shallow copy of it).
 * @returns {string|null} - The zero-padded country code, or null if missing.
 */
function resolveCountryCode(req) {
  const tc = req && req.query ? req.query.tc : undefined;
  if (tc === undefined || tc === null || tc === "") return null;
  return String(tc).trim().padStart(3, "0");
}

/**
 * Pick the least-served enabled block for a country code, or null if the code
 * isn't configured / has no enabled blocks. The countryblock table is the single
 * source of truth (managed via CSV import), so support for a country is simply
 * "does it have enabled rows?".
 */
async function pickBlock(code) {
  if (!code) return null;
  return db.countryblock.findOne({
    where: { countryCode: code, enabled: true },
    order: [
      ["assignedCount", "ASC"],
      ["block", "ASC"],
    ],
  });
}

const experiment = {
  experimentName: "country-bundle",

  // Higher priority wins when multiple experiments are eligible for a request.
  // Country-targeted participants (identified by the `tc` URL param) must always
  // receive their country's bundle, so this outranks the default (priority 0)
  // and any other experiment that doesn't opt into a higher value.
  priority: 100,

  // A single gateway treatment. The controller runs `validity` synchronously to
  // decide eligibility, so we keep it cheap: just "did the request carry a `tc`
  // code?". The authoritative check (is that country configured with enabled
  // blocks?) happens in treatmentAssigner via a DB read; if not, it returns null
  // and the controller drops this experiment.
  treatments: [
    {
      params: {},
      function: GetStatementById,
      validity: (req) => resolveCountryCode(req) !== null,
    },
  ],

  treatmentAssigner: async (validTreatments, req) => {
    const code = resolveCountryCode(req);

    // The controller enriches the gateway treatment with `experiment_name` /
    // `experiment_assigner`; carry that metadata onto whichever block we pick so
    // the created experiment row is typed as "country-bundle".
    const gateway = (validTreatments && validTreatments[0]) || {};
    const { params: _ignored, ...gatewayMeta } = gateway;

    // Round-robin via a maintained counter, NOT by aggregating the (large)
    // experiments table. We read the enabled blocks for this country ordered by
    // how many times each has been assigned, pick the least-served one, and
    // atomically bump its counter. This is a tiny indexed read over ~5 rows and
    // a single-row update, so cost is constant regardless of how big the
    // experiments table grows.
    const block = await pickBlock(code);
    if (!block) return null;

    // Atomic increment so concurrent assignments still move the counter forward.
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
