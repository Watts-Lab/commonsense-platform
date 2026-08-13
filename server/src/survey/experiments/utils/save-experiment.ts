import { experiments } from '../../../db/models';

export async function createExperiment(
  experimentData: Record<string, unknown>,
) {
  const newExperiment = await experiments.create(experimentData);
  return newExperiment;
}

export async function updateExperiment(
  experimentId: number,
  experimentData: Record<string, unknown>,
) {
  return experiments.update(experimentData, {
    where: { id: experimentId },
  });
}
