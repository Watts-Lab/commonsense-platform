const statementsFindAllMock = jest.fn();
const ratingsFindAllMock = jest.fn();
const ratingsFindOrCreateMock = jest.fn();
const ratingsUpdateMock = jest.fn();
const ratingsBulkCreateMock = jest.fn();
const experimentsFindAllMock = jest.fn();
const experimentsUpdateMock = jest.fn();
const transactionMock = jest.fn((cb: (t: unknown) => unknown) => cb({}));

jest.mock('../../../db/models', () => ({
  statements: { findAll: (...a: unknown[]) => statementsFindAllMock(...a) },
  statementcountryratings: {
    findAll: (...a: unknown[]) => ratingsFindAllMock(...a),
    findOrCreate: (...a: unknown[]) => ratingsFindOrCreateMock(...a),
    update: (...a: unknown[]) => ratingsUpdateMock(...a),
    bulkCreate: (...a: unknown[]) => ratingsBulkCreateMock(...a),
  },
  experiments: {
    findAll: (...a: unknown[]) => experimentsFindAllMock(...a),
    update: (...a: unknown[]) => experimentsUpdateMock(...a),
  },
  db: {
    sequelize: {
      transaction: (...a: unknown[]) =>
        (transactionMock as unknown as (...args: unknown[]) => unknown)(...a),
    },
  },
}));

import {
  getGlobalOrder,
  sweepStaleReservations,
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
    ratingsUpdateMock.mockResolvedValue([1]);
    ratingsBulkCreateMock.mockResolvedValue([]);
    experimentsUpdateMock.mockResolvedValue([1]);
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

    it('skips statements the database refuses to reserve', async () => {
      statementsFindAllMock.mockResolvedValueOnce([{ id: 1 }, { id: 2 }]);
      ratingsFindAllMock.mockResolvedValueOnce([]);
      // Statement 1 was just taken by a concurrent request; statement 2 is free.
      ratingsUpdateMock.mockResolvedValueOnce([0]).mockResolvedValueOnce([1]);

      const ids = await computeActiveSet('818', 15);
      expect(ids).toEqual([2]);
    });

    it('returns an empty array for an untracked country code', async () => {
      statementsFindAllMock.mockResolvedValueOnce([{ id: 1 }]);
      ratingsFindAllMock.mockResolvedValueOnce([]);

      const ids = await computeActiveSet('250' /* France, untracked */, 15);
      expect(ids).toEqual([]);
      expect(experimentsFindAllMock).not.toHaveBeenCalled();
    });
  });

  describe('sweepStaleReservations', () => {
    const staleRow = (id: number, info: unknown) => ({
      get: (key: string) => (key === 'id' ? id : info),
    });

    it('releases each stale assignment once and marks it swept', async () => {
      experimentsFindAllMock.mockResolvedValueOnce([
        staleRow(7, { countryCode: '818', params: { ids: [1, 2] } }),
      ]);

      await sweepStaleReservations();

      expect(experimentsUpdateMock).toHaveBeenCalledWith(
        { staleSwept: true },
        { where: { id: 7, staleSwept: false } },
      );
      expect(ratingsUpdateMock).toHaveBeenCalledTimes(1);
    });

    it('does not release when another sweep already claimed the row', async () => {
      experimentsFindAllMock.mockResolvedValueOnce([
        staleRow(7, { countryCode: '818', params: { ids: [1] } }),
      ]);
      experimentsUpdateMock.mockResolvedValueOnce([0]);

      await sweepStaleReservations();

      expect(ratingsUpdateMock).not.toHaveBeenCalled();
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
