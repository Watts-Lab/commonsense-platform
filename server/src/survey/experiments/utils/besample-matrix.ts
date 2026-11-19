import { Op, Sequelize, Transaction } from 'sequelize';
import {
  db,
  statements,
  statementcountryratings,
  experiments,
} from '../../../db/models';
import { ALL_COUNTRY_CODES } from './country-codes';

// A cell (statement, country) is "filled" once it has this many confirmed
// ratings -- see strategy.md Step 2.
const MIN_RATINGS = 10;

// Session timeout for an in-flight (unfinished) besample-sampling assignment
// before its reservation is released -- see strategy.md Step 7.
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
  // confirmedCount per country code -> statement id, only for cells that
  // have at least one confirmed rating. A missing cell means 0 confirmed.
  // Kept sparse: a dense ~250 countries x every statement map would be large
  // and almost entirely 0.
  confirmed: Map<string, Map<number, number>>;
  computedAt: number;
}

let cache: GlobalOrder | null = null;

function remainingFor(
  globalOrder: GlobalOrder,
  countryCode: string,
  statementId: number,
): number {
  const confirmed =
    globalOrder.confirmed.get(countryCode)?.get(statementId) ?? 0;
  return Math.max(0, MIN_RATINGS - confirmed);
}

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
    where: { confirmedCount: { [Op.gt]: 0 } },
    attributes: ['statementId', 'countryCode', 'confirmedCount'],
    raw: true,
  });

  const confirmed = new Map<string, Map<number, number>>();
  for (const row of ratingRows as unknown as Array<{
    statementId: number;
    countryCode: string;
    confirmedCount: number;
  }>) {
    if (!confirmed.has(row.countryCode)) {
      confirmed.set(row.countryCode, new Map());
    }
    confirmed.get(row.countryCode)!.set(row.statementId, row.confirmedCount);
  }

  // Every country counts toward R(i): all ISO 3166-1 countries plus any other
  // code that already has ratings, so the set grows with the data instead of
  // being a fixed list.
  const countryCount = new Set([...ALL_COUNTRY_CODES, ...confirmed.keys()])
    .size;

  // R(i) = sum over countries j of max(0, MIN_RATINGS - n(i,j)). A country
  // with no ratings for i contributes MIN_RATINGS, so
  // R(i) = MIN_RATINGS * countryCount - sum over stored cells of min(MIN_RATINGS, n(i,j)).
  const filledByStatement = new Map<number, number>();
  for (const cells of confirmed.values()) {
    for (const [statementId, count] of cells) {
      filledByStatement.set(
        statementId,
        (filledByStatement.get(statementId) ?? 0) +
          Math.min(MIN_RATINGS, count),
      );
    }
  }

  const ranked: Array<{ id: number; r: number }> = [];
  for (const id of publishedIds) {
    const r = MIN_RATINGS * countryCount - (filledByStatement.get(id) ?? 0);
    if (r > 0) ranked.push({ id, r });
  }

  ranked.sort((a, b) => a.r - b.r || a.id - b.id);

  return {
    order: ranked.map((entry) => entry.id),
    confirmed,
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

// Decrements pendingCount for a session's reserved cells, never below zero.
export async function releasePending(
  countryCode: string,
  statementIds: number[],
): Promise<void> {
  if (statementIds.length === 0) return;
  await statementcountryratings.update(
    {
      pendingCount: Sequelize.literal('pendingCount - 1') as unknown as number,
    },
    {
      where: {
        countryCode,
        statementId: { [Op.in]: statementIds },
        pendingCount: { [Op.gt]: 0 },
      },
    },
  );
}

// Frees reservations of unfinished assignments older than SESSION_TTL_MS, bounded per call.
export async function sweepStaleReservations(): Promise<void> {
  const stale = await experiments.findAll({
    where: {
      experimentType: 'besample-sampling',
      finished: false,
      staleSwept: false,
      createdAt: { [Op.lt]: new Date(Date.now() - SESSION_TTL_MS) },
    },
    attributes: ['id', 'experimentInfo'],
    limit: 200,
  });

  for (const row of stale) {
    // Only the caller that flips the flag releases, so concurrent sweeps can't double-release.
    const [claimed] = await experiments.update(
      { staleSwept: true },
      { where: { id: row.get('id') as number, staleSwept: false } },
    );
    if (!claimed) continue;

    const info = row.get('experimentInfo') as
      { countryCode?: string; params?: { ids?: number[] } } | null | undefined;
    if (info?.countryCode) {
      await releasePending(info.countryCode, info.params?.ids ?? []);
    }
  }
}

// Atomic: only succeeds while confirmed + pending is still under MIN_RATINGS in the DB.
async function tryReserve(
  countryCode: string,
  statementId: number,
): Promise<boolean> {
  const [affected] = await statementcountryratings.update(
    {
      pendingCount: Sequelize.literal('pendingCount + 1') as unknown as number,
    },
    {
      where: {
        statementId,
        countryCode,
        [Op.and]: [
          Sequelize.where(
            Sequelize.literal('confirmedCount + pendingCount'),
            Op.lt,
            MIN_RATINGS,
          ),
        ],
      },
    },
  );
  return affected > 0;
}

// Reserves and returns up to `size` highest-priority statements that still need ratings for `countryCode`.
export async function computeActiveSet(
  countryCode: string,
  size = 15,
): Promise<number[]> {
  if (!countryCode) return [];
  const globalOrder = await getGlobalOrder();

  await sweepStaleReservations();

  // This country's local order: the global order, minus statements this
  // country has already filled (as of the cached snapshot -- tryReserve
  // re-checks against the live row).
  const candidates = globalOrder.order.filter(
    (id) => remainingFor(globalOrder, countryCode, id) > 0,
  );
  const activeSet: number[] = [];
  const chunkSize = size * 3;

  for (let start = 0; start < candidates.length; start += chunkSize) {
    if (activeSet.length >= size) break;
    const chunk = candidates.slice(start, start + chunkSize);

    // Cells are created lazily; reservation needs the row to exist.
    await statementcountryratings.bulkCreate(
      chunk.map((statementId) => ({ statementId, countryCode })),
      { ignoreDuplicates: true },
    );

    for (const id of chunk) {
      if (activeSet.length >= size) break;
      if (await tryReserve(countryCode, id)) activeSet.push(id);
    }
  }
  return activeSet;
}

// +1 confirmedCount per unique statement for this country, inside the caller's transaction.
export async function incrementConfirmed(
  countryCode: string,
  statementIds: number[],
  transaction: Transaction,
): Promise<void> {
  for (const statementId of Array.from(new Set(statementIds))) {
    const [row] = await statementcountryratings.findOrCreate({
      where: { statementId, countryCode },
      defaults: { statementId, countryCode, confirmedCount: 0 },
      transaction,
    });
    await row.increment('confirmedCount', { by: 1, transaction });
  }
}

// Confirms ratings (+1 confirmedCount per unique statement); releaseReservation also drops the session's pendingCount.
export async function bumpCountryRatings(
  countryCode: string,
  statementIds: number[],
  releaseReservation = false,
): Promise<void> {
  const uniqueIds = Array.from(new Set(statementIds));
  if (uniqueIds.length === 0) return;

  await db.sequelize.transaction(async (transaction) => {
    await incrementConfirmed(countryCode, uniqueIds, transaction);
    if (releaseReservation) {
      await statementcountryratings.update(
        {
          pendingCount: Sequelize.literal(
            'pendingCount - 1',
          ) as unknown as number,
        },
        {
          where: {
            countryCode,
            statementId: { [Op.in]: uniqueIds },
            pendingCount: { [Op.gt]: 0 },
          },
          transaction,
        },
      );
    }
  });
}
