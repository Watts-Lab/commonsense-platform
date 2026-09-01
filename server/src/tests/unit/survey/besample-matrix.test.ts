const statementsFindAllMock = jest.fn();
const ratingsFindAllMock = jest.fn();
const ratingsFindOrCreateMock = jest.fn();
const experimentsFindAllMock = jest.fn();
const transactionMock = jest.fn((cb: (t: unknown) => unknown) => cb({}));

jest.mock('../../../db/models', () => ({
  statements: { findAll: (...a: unknown[]) => statementsFindAllMock(...a) },
  statementcountryratings: {
    findAll: (...a: unknown[]) => ratingsFindAllMock(...a),
    findOrCreate: (...a: unknown[]) => ratingsFindOrCreateMock(...a),
  },
  experiments: { findAll: (...a: unknown[]) => experimentsFindAllMock(...a) },
  db: {
    sequelize: {
      transaction: (...a: unknown[]) =>
        (transactionMock as unknown as (...args: unknown[]) => unknown)(...a),
    },
  },
}));

import {
  getGlobalOrder,
  getLivePending,
  computeActiveSet,
  bumpCountryRatings,
  _resetGlobalOrderCacheForTests,
} from '../../../survey/experiments/utils/besample-matrix';

describe('besample-matrix', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    _resetGlobalOrderCacheForTests();
    transactionMock.mockImplementation((cb: (t: unknown) => unknown) => cb({}));
    experimentsFindAllMock.mockResolvedValue([]);
  });

  describe('computeActiveSet', () => {
    it("returns statements in R(i) ascending order, filtered to this country's remaining need", async () => {
      statementsFindAllMock.mockResolvedValueOnce([
        { id: 1 },
        { id: 2 },
        { id: 3 },
      ]);
      // Egypt confirmed: statement 1 -> 9 (remaining 1), statement 2 -> 10
      // (remaining 0, filled), statement 3 -> 0 (remaining 10). Every other
      // tracked country has no row (remaining 10 for all three statements).
      ratingsFindAllMock.mockResolvedValueOnce([
        { statementId: 1, countryCode: '818', confirmedCount: 9 },
        { statementId: 2, countryCode: '818', confirmedCount: 10 },
      ]);

      const ids = await computeActiveSet('818', 15);

      // Statement 2 is filled for Egypt specifically -> excluded even though
      // its global R(i) is lower than statement 1's. Among the remaining
      // Egypt-eligible statements, lowest global R(i) comes first.
      expect(ids).toEqual([1, 3]);
    });

    it('caps the active set at `size`', async () => {
      const rows = Array.from({ length: 20 }, (_, i) => ({ id: i + 1 }));
      statementsFindAllMock.mockResolvedValueOnce(rows);
      ratingsFindAllMock.mockResolvedValueOnce([]);

      const ids = await computeActiveSet('818', 5);
      expect(ids).toHaveLength(5);
    });

    it('subtracts live pending reservations from remaining need', async () => {
      statementsFindAllMock.mockResolvedValueOnce([{ id: 1 }]);
      // Egypt confirmed 9 -> remaining 1 for statement 1.
      ratingsFindAllMock.mockResolvedValueOnce([
        { statementId: 1, countryCode: '818', confirmedCount: 9 },
      ]);
      // An in-flight besample-sampling session already reserved statement 1
      // for Egypt -> effective remaining is 1 - 1 = 0.
      experimentsFindAllMock.mockResolvedValueOnce([
        {
          get: (key: string) =>
            key === 'experimentInfo'
              ? { countryCode: '818', params: { ids: [1] } }
              : undefined,
        },
      ]);

      const ids = await computeActiveSet('818', 15);
      expect(ids).toEqual([]);
    });

    it('returns an empty array for an untracked country code', async () => {
      statementsFindAllMock.mockResolvedValueOnce([{ id: 1 }]);
      ratingsFindAllMock.mockResolvedValueOnce([]);

      const ids = await computeActiveSet('250' /* France, untracked */, 15);
      expect(ids).toEqual([]);
      expect(experimentsFindAllMock).not.toHaveBeenCalled();
    });
  });

  describe('getLivePending', () => {
    it('only tallies in-flight rows for the requested country', async () => {
      experimentsFindAllMock.mockResolvedValueOnce([
        {
          get: (key: string) =>
            key === 'experimentInfo'
              ? { countryCode: '818', params: { ids: [1, 2] } }
              : undefined,
        },
        {
          get: (key: string) =>
            key === 'experimentInfo'
              ? { countryCode: '076', params: { ids: [1] } } // different country
              : undefined,
        },
      ]);

      const pending = await getLivePending('818');
      expect(pending.get(1)).toBe(1);
      expect(pending.get(2)).toBe(1);
      expect(pending.has(3)).toBe(false);
    });
  });

  describe('bumpCountryRatings', () => {
    it('dedupes statement ids and increments each row inside a transaction', async () => {
      const incrementMock = jest.fn().mockResolvedValue(undefined);
      ratingsFindOrCreateMock.mockImplementation(async () => [
        { increment: incrementMock },
        false,
      ]);

      await bumpCountryRatings('818', [1, 1, 2]);

      expect(transactionMock).toHaveBeenCalledTimes(1);
      expect(ratingsFindOrCreateMock).toHaveBeenCalledTimes(2); // deduped
      expect(incrementMock).toHaveBeenCalledTimes(2);
      expect(incrementMock).toHaveBeenCalledWith(
        'confirmedCount',
        expect.objectContaining({ by: 1 }),
      );
    });

    it('is a no-op for an empty statement list', async () => {
      await bumpCountryRatings('818', []);
      expect(transactionMock).not.toHaveBeenCalled();
    });
  });

  describe('getGlobalOrder caching', () => {
    it('does not requery within the refresh window', async () => {
      statementsFindAllMock.mockResolvedValue([{ id: 1 }]);
      ratingsFindAllMock.mockResolvedValue([]);

      await getGlobalOrder();
      await getGlobalOrder();

      expect(statementsFindAllMock).toHaveBeenCalledTimes(1);
    });
  });
});
