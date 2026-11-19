export {};

const computeActiveSetMock = jest.fn();
const findExperimentMock = jest.fn();

jest.mock('../../../survey/experiments/utils/besample-matrix', () => ({
  computeActiveSet: (...args: unknown[]) => computeActiveSetMock(...args),
}));

jest.mock('../../../db/models', () => ({
  experiments: {
    findOne: (...args: unknown[]) => findExperimentMock(...args),
  },
}));

describe('besample experiment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    findExperimentMock.mockResolvedValue(null);
  });

  describe('validity', () => {
    const validity = async (req: Record<string, unknown>) =>
      (
        await import('../../../survey/experiments/besample.experiment')
      ).default.treatments[0].validity(req);

    it('is eligible for any valid tc country, not just past Besample countries', async () => {
      expect(await validity({ query: { tc: '250' } })).toBe(true); // France
      expect(await validity({ query: { tc: '76' } })).toBe(true); // Brazil
    });

    it('is eligible for any geo-header country without Besample params', async () => {
      for (const country of ['BR', 'DE', 'us']) {
        expect(
          await validity({
            query: {},
            headers: { 'cloudfront-viewer-country': country },
          }),
        ).toBe(true);
      }
    });

    it('is not eligible when the country cannot be inferred', async () => {
      expect(await validity({ query: {} })).toBe(false);
      // Besample params alone don't identify a country.
      expect(await validity({ query: { bpid: 'x', battempt: 'y' } })).toBe(
        false,
      );
      expect(await validity({ query: { tc: '999' } })).toBe(false);
      expect(
        await validity({
          query: {},
          headers: { 'cloudfront-viewer-country': 'XX' },
        }),
      ).toBe(false);
    });
  });

  describe('treatmentAssigner', () => {
    it('returns null when the country cannot be inferred', async () => {
      const besampleExperiment = (
        await import('../../../survey/experiments/besample.experiment')
      ).default;

      const result = await besampleExperiment.treatmentAssigner(
        [{ params: {}, function: jest.fn() }],
        { query: {} },
      );

      expect(result).toBeNull();
      expect(computeActiveSetMock).not.toHaveBeenCalled();
    });

    it('returns null when the country queue is exhausted', async () => {
      computeActiveSetMock.mockResolvedValueOnce([]);
      const besampleExperiment = (
        await import('../../../survey/experiments/besample.experiment')
      ).default;

      const result = await besampleExperiment.treatmentAssigner(
        [{ params: {}, function: jest.fn() }],
        { query: { tc: '818' } },
      );

      expect(result).toBeNull();
    });

    it('assigns the computed active set with the resolved country code', async () => {
      computeActiveSetMock.mockResolvedValueOnce([101, 102, 103]);
      const besampleExperiment = (
        await import('../../../survey/experiments/besample.experiment')
      ).default;

      const result = (await besampleExperiment.treatmentAssigner(
        [
          {
            experiment_name: 'besample-sampling',
            params: {},
            function: jest.fn(),
          },
        ],
        { query: { tc: '76', sessionId: 'session-1' } }, // Brazil, unpadded
      )) as any;

      expect(findExperimentMock).toHaveBeenCalledWith({
        where: { sessionId: 'session-1', experimentType: 'besample-sampling' },
      });
      expect(computeActiveSetMock).toHaveBeenCalledWith('076', 15);
      expect(result.countryCode).toBe('076');
      expect(result.countrySource).toBe('tc');
      expect(result.params).toEqual({ ids: [101, 102, 103] });
    });

    it('uses tc instead of a different geo-header country', async () => {
      computeActiveSetMock.mockResolvedValueOnce([201]);
      const besampleExperiment = (
        await import('../../../survey/experiments/besample.experiment')
      ).default;

      const result = (await besampleExperiment.treatmentAssigner(
        [{ params: {}, function: jest.fn() }],
        {
          query: { tc: '818', sessionId: 'session-tc' },
          headers: { 'cloudfront-viewer-country': 'BR' },
        },
      )) as any;

      expect(computeActiveSetMock).toHaveBeenCalledWith('818', 15);
      expect(result.countryCode).toBe('818');
      expect(result.countrySource).toBe('tc');
    });

    it('uses geo-header country when tc is absent', async () => {
      computeActiveSetMock.mockResolvedValueOnce([201]);
      const besampleExperiment = (
        await import('../../../survey/experiments/besample.experiment')
      ).default;

      const result = (await besampleExperiment.treatmentAssigner(
        [{ params: {}, function: jest.fn() }],
        {
          query: { sessionId: 'session-geo' },
          headers: { 'cloudfront-viewer-country': 'BR' },
        },
      )) as any;

      expect(computeActiveSetMock).toHaveBeenCalledWith('076', 15);
      expect(result.countryCode).toBe('076');
      expect(result.countrySource).toBe('geo');
    });

    it('assigns a country outside the original 16 from tc', async () => {
      computeActiveSetMock.mockResolvedValueOnce([301]);
      const besampleExperiment = (
        await import('../../../survey/experiments/besample.experiment')
      ).default;

      const result = (await besampleExperiment.treatmentAssigner(
        [{ params: {}, function: jest.fn() }],
        { query: { tc: '250', sessionId: 'session-fr' } }, // France
      )) as any;

      expect(computeActiveSetMock).toHaveBeenCalledWith('250', 15);
      expect(result.countryCode).toBe('250');
      expect(result.countrySource).toBe('tc');
    });

    it('falls back to the geo-header country when tc is not a valid country', async () => {
      computeActiveSetMock.mockResolvedValueOnce([401]);
      const besampleExperiment = (
        await import('../../../survey/experiments/besample.experiment')
      ).default;

      const result = (await besampleExperiment.treatmentAssigner(
        [{ params: {}, function: jest.fn() }],
        {
          query: { tc: '999', sessionId: 'session-placeholder' },
          headers: { 'cloudfront-viewer-country': 'DE' },
        },
      )) as any;

      expect(computeActiveSetMock).toHaveBeenCalledWith('276', 15);
      expect(result.countryCode).toBe('276');
      expect(result.countrySource).toBe('geo');
    });

    it('returns null when this session already has a besample-sampling experiment', async () => {
      findExperimentMock.mockResolvedValueOnce({ id: 1 });
      const besampleExperiment = (
        await import('../../../survey/experiments/besample.experiment')
      ).default;

      const result = await besampleExperiment.treatmentAssigner(
        [{ params: {}, function: jest.fn() }],
        { query: { tc: '818', sessionId: 'session-2' } },
      );

      expect(result).toBeNull();
      expect(computeActiveSetMock).not.toHaveBeenCalled();
    });

    it('declares a priority higher than the default/daily-experiment tier', async () => {
      const besampleExperiment = (
        await import('../../../survey/experiments/besample.experiment')
      ).default;

      expect(besampleExperiment.priority).toBeGreaterThan(0);
    });
  });
});
