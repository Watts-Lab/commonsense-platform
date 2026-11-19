import { experiments } from '../../db/models';
import { GetStatementById } from '../treatments/statement-by-id.treatment';
import { resolveCountryFromRequest } from './utils/country-codes';
import { computeActiveSet } from './utils/besample-matrix';

interface RequestLike {
  query?: Record<string, unknown>;
  headers?: Record<string, string | string[] | undefined>;
}

// Country for this request: a valid Besample `tc` wins, otherwise the
// CloudFront viewer country (inferred from the IP address). Any ISO 3166-1
// country qualifies. null means the country can't be inferred -- the request
// then falls through to the other experiments, as it always has.
function resolveCountry(req: RequestLike) {
  return resolveCountryFromRequest(
    req?.headers?.['cloudfront-viewer-country'],
    req?.query?.tc,
  );
}

const ACTIVE_SET_SIZE = 15;

const experiment = {
  experimentName: 'besample-sampling',

  // The name predates sampling every country; it now covers Besample and
  // organic participants alike (`countrySource` tells them apart). Kept so
  // existing rows, the once-per-session guard and the reservation sweep all
  // keep matching.
  //
  // Highest priority wins: any participant whose country is known gets the
  // row-priority dynamic-frontier assignment over the default (0) or
  // daily-experiment (0).
  priority: 100,

  // Cheap sync eligibility gate (just "is the country known?"); the real
  // check (its queue not exhausted) happens in treatmentAssigner via
  // computeActiveSet.
  treatments: [
    {
      params: {},
      function: GetStatementById,
      validity: (req: RequestLike) => resolveCountry(req) !== null,
    },
  ],

  treatmentAssigner: async (
    validTreatments: Array<Record<string, unknown>>,
    req: RequestLike,
  ) => {
    const country = resolveCountry(req);
    if (!country) return null;

    // A session gets exactly one besample-sampling assignment, ever. Without
    // this guard, a participant who finishes and then revisits the same URL
    // (back button, reload, resent link) would fall past step 1's "resume
    // unfinished experiment" check in returnStatements (their prior row is
    // already finished) and land right back here, minting a second
    // experiments row and re-answering statements that were already counted
    // in the matrix -- unlike daily-experiment's per-day re-eligibility, this
    // experiment type has no legitimate reason to ever assign the same
    // session twice.
    const sessionId = req?.query?.sessionId as string | undefined;
    if (sessionId) {
      const alreadyAssigned = await experiments.findOne({
        where: { sessionId, experimentType: 'besample-sampling' },
      });
      if (alreadyAssigned) return null;
    }

    // Carry the controller-injected metadata (experiment_name/assigner) onto
    // the returned assignment, same pattern as the legacy country experiment.
    const gateway = (validTreatments && validTreatments[0]) || {};
    const { params: _ignored, ...gatewayMeta } = gateway;

    const ids = await computeActiveSet(country.code, ACTIVE_SET_SIZE);
    if (ids.length === 0) return null; // this country's queue is exhausted

    return {
      ...gatewayMeta,
      countryCode: country.code,
      countrySource: country.source,
      params: { ids },
      function: GetStatementById,
    };
  },
};

export default experiment;
