import { Op } from 'sequelize';
import {
  db,
  statements,
  statementcountryratings,
  experiments,
} from '../../../db/models';
import { BESAMPLE_COUNTRY_CODES } from './besample-countries';

// A cell (statement, country) is "filled" once it has this many confirmed
// ratings -- see strategy.md Step 2.
const MIN_RATINGS = 10;

// Session timeout for an in-flight (unfinished) besample-sampling assignment
// before its reservation is released -- see strategy.md Step 7. Deliberately
// separate from the legacy country-bundle's 30-minute INFLIGHT_TTL_MS.
const SESSION_TTL_MS = 45 * 60 * 1000;

// How often the global row-priority order is recomputed -- see strategy.md
// Step 5 ("recomputed regularly, e.g. every hour"). Recomputation is lazy (on
// next access past staleness), not a background timer.
const REFRESH_MS =
  Number(process.env.BESAMPLE_MATRIX_REFRESH_MS) || 60 * 60 * 1000;

interface GlobalOrder {
  // Published, not-yet-fully-filled (R(i) > 0) statement ids, sorted
  // ascending by R(i) then id -- the single global ranking every country's
  // queue draws from.
  order: number[];
  // Per country code, remaining(i,j) for every published statement id.
  perCountryRemaining: Map<string, Map<number, number>>;
  computedAt: number;
}

let cache: GlobalOrder | null = null;

async function computeGlobalOrder(): Promise<GlobalOrder> {
  const publishedRows = await statements.findAll({
    where: { published: true },
    attributes: ['id'],
    raw: true,
  });
  const publishedIds = (publishedRows as unknown as Array<{ id: number }>).map(
    (row) => row.id,
  );

  const ratingRows = await statementcountryratings.findAll({
    where: { countryCode: BESAMPLE_COUNTRY_CODES as unknown as string[] },
    attributes: ['statementId', 'countryCode', 'confirmedCount'],
    raw: true,
  });

  const confirmedByStatement = new Map<number, Map<string, number>>();
  for (const row of ratingRows as unknown as Array<{
    statementId: number;
    countryCode: string;
    confirmedCount: number;
  }>) {
    if (!confirmedByStatement.has(row.statementId)) {
      confirmedByStatement.set(row.statementId, new Map());
    }
    confirmedByStatement
      .get(row.statementId)!
      .set(row.countryCode, row.confirmedCount);
  }

  const perCountryRemaining = new Map<string, Map<number, number>>();
  for (const code of BESAMPLE_COUNTRY_CODES) {
    perCountryRemaining.set(code, new Map());
  }

  const ranked: Array<{ id: number; r: number }> = [];

  for (const id of publishedIds) {
    const confirmedForStatement = confirmedByStatement.get(id);
    let r = 0;
    for (const code of BESAMPLE_COUNTRY_CODES) {
      const confirmed = confirmedForStatement?.get(code) ?? 0;
      const remaining = Math.max(0, MIN_RATINGS - confirmed);
      perCountryRemaining.get(code)!.set(id, remaining);
      r += remaining;
    }
    if (r > 0) ranked.push({ id, r });
  }

  ranked.sort((a, b) => a.r - b.r || a.id - b.id);

  return {
    order: ranked.map((entry) => entry.id),
    perCountryRemaining,
    computedAt: Date.now(),
  };
}

export async function getGlobalOrder(): Promise<GlobalOrder> {
  if (!cache || Date.now() - cache.computedAt > REFRESH_MS) {
    cache = await computeGlobalOrder();
  }
  return cache;
}

// Test-only escape hatch to force the next getGlobalOrder() call to recompute.
export function _resetGlobalOrderCacheForTests(): void {
  cache = null;
}

// Live (unpersisted) pending count per statement for one country: how many
// currently-unfinished, not-yet-timed-out besample-sampling sessions have
// this statement in their assigned set. Derived from `experiments` rather
// than a maintained counter, mirroring how the legacy country-bundle
// in-flight check already worked.
export async function getLivePending(
  countryCode: string,
): Promise<Map<number, number>> {
  const cutoff = new Date(Date.now() - SESSION_TTL_MS);

  const inFlight = await experiments.findAll({
    where: {
      experimentType: 'besample-sampling',
      finished: false,
      createdAt: { [Op.gte]: cutoff },
    },
    attributes: ['experimentInfo'],
  });

  const pending = new Map<number, number>();
  for (const row of inFlight) {
    const info = row.get('experimentInfo') as
      { countryCode?: string; params?: { ids?: number[] } } | null | undefined;
    if (!info || info.countryCode !== countryCode) continue;
    for (const id of info.params?.ids ?? []) {
      pending.set(id, (pending.get(id) ?? 0) + 1);
    }
  }
  return pending;
}

// The next participant's assigned statement set for `countryCode`: the
// highest-global-priority statements that still have room after accounting
// for both confirmed ratings and live reservations. Recomputed fresh on every
// call rather than tracking a persistent per-country pointer/window -- this
// is stateless across requests and process restarts while still satisfying
// strategy.md Step 6 (never show an already-filled cell, highest priority
// first, naturally adapts as the matrix changes).
export async function computeActiveSet(
  countryCode: string,
  size = 15,
): Promise<number[]> {
  const { order, perCountryRemaining } = await getGlobalOrder();
  const remainMap = perCountryRemaining.get(countryCode);
  if (!remainMap) return [];

  const pendingMap = await getLivePending(countryCode);

  const activeSet: number[] = [];
  for (const id of order) {
    const remaining = remainMap.get(id) ?? 0;
    if (remaining <= 0) continue;
    const pending = pendingMap.get(id) ?? 0;
    if (remaining - pending <= 0) continue;
    activeSet.push(id);
    if (activeSet.length === size) break;
  }
  return activeSet;
}

// Confirms ratings for a set of statements at a country: bumps
// `confirmedCount` by 1 for each (deduplicated) statement id. Called once a
// session's country is known and its ratings are considered final -- either a
// besample-sampling experiment finishing, or an organic participant
// self-reporting one of the 16 tracked countries.
export async function bumpCountryRatings(
  countryCode: string,
  statementIds: number[],
): Promise<void> {
  const uniqueIds = Array.from(new Set(statementIds));
  if (uniqueIds.length === 0) return;

  await db.sequelize.transaction(async (transaction) => {
    for (const statementId of uniqueIds) {
      const [row] = await statementcountryratings.findOrCreate({
        where: { statementId, countryCode },
        defaults: { statementId, countryCode, confirmedCount: 0 },
        transaction,
      });
      await row.increment('confirmedCount', { by: 1, transaction });
    }
  });
}
