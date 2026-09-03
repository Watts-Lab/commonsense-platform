import { GetStatementById } from '../treatments/statement-by-id.treatment';
import { resolveCountryCodeFromTc } from './utils/besample-countries';
import { computeActiveSet } from './utils/besample-matrix';

interface RequestLike {
  query?: Record<string, unknown>;
}

// Besample appends all four of these to every recruitment link; presence of
// any one of them marks a participant as Besample-recruited (see
// strategy.md). Country itself is always resolved from `tc` specifically.
function hasBesampleParams(req: RequestLike): boolean {
  const query = req?.query ?? {};
  return Boolean(query.tc || query.bpid || query.bnum || query.battempt);
}

const ACTIVE_SET_SIZE = 15;

const experiment = {
  experimentName: 'besample-sampling',

  // Highest priority wins; Besample-recruited participants targeting a
  // trackable country must always get the row-priority dynamic-frontier
  // assignment over the default (0) or daily-experiment (0).
  priority: 100,

  // Cheap sync eligibility gate (just "does this look like a Besample
  // visit?"); the real check (country trackable, its queue not exhausted)
  // happens in treatmentAssigner via computeActiveSet.
  treatments: [
    {
      params: {},
      function: GetStatementById,
      validity: (req: RequestLike) => hasBesampleParams(req),
    },
  ],

  treatmentAssigner: async (
    validTreatments: Array<Record<string, unknown>>,
    req: RequestLike,
  ) => {
    const code = resolveCountryCodeFromTc(req?.query?.tc);
    if (!code) return null;

    // Carry the controller-injected metadata (experiment_name/assigner) onto
    // the returned assignment, same pattern as the legacy country experiment.
    const gateway = (validTreatments && validTreatments[0]) || {};
    const { params: _ignored, ...gatewayMeta } = gateway;

    const ids = await computeActiveSet(code, ACTIVE_SET_SIZE);
    if (ids.length === 0) return null; // this country's queue is exhausted

    return {
      ...gatewayMeta,
      countryCode: code,
      params: { ids },
      function: GetStatementById,
    };
  },
};

export default experiment;
