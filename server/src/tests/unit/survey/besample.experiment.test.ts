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
    it.each(['tc', 'bpid', 'bnum', 'battempt'])(
      'is eligible when `%s` is present',
      async (param) => {
        const besampleExperiment = (
          await import('../../../survey/experiments/besample.experiment')
        ).default;

        expect(
          besampleExperiment.treatments[0].validity({
            query: { [param]: 'x' },
          }),
        ).toBe(true);
      },
    );

    it('is not eligible when none of the Besample params are present', async () => {
      const besampleExperiment = (
        await import('../../../survey/experiments/besample.experiment')
      ).default;

      expect(besampleExperiment.treatments[0].validity({ query: {} })).toBe(
        false,
      );
    });
  });

  describe('treatmentAssigner', () => {
    it('returns null when tc is missing or unmappable', async () => {
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
      expect(result.params).toEqual({ ids: [101, 102, 103] });
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
