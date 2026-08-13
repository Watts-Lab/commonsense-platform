import { individuals } from '../../../db/models';

export async function saveIndividualDB(
  individualData: Record<string, unknown>,
) {
  return individuals.create(individualData);
}
