// Counts organic (non-Besample) participants' ratings toward the country they
// self-report in demographics (`country_reside`), for every statement they
// answered. viewerCountry is never used for counting -- it only decides which
// statements a participant is served.
//
// Each finished experiment is credited at most once (experiments.selfReportCredited),
// from whichever happens second:
//   - the experiment finishing (saveExperiment), if demographics already exist
//     for the session -- covers returning participants, who skip demographics;
//   - demographics being saved (saveIndividual), for any already-finished,
//     not-yet-credited experiment of the session.
//
// Besample sessions (a besample-sampling row assigned by `tc`) keep their own
// counting by `tc` country on completion and are never credited here.
import { Op } from 'sequelize';
import { answers, db, experiments, individuals } from '../../../db/models';
import { incrementConfirmed } from './besample-matrix';
import { resolveCountryCodeFromName } from './country-codes';

const DEMOGRAPHICS_TYPES = ['demographics', 'demographicsLongInternational'];

export function isDemographicsType(informationType: unknown): boolean {
  return DEMOGRAPHICS_TYPES.includes(informationType as string);
}

export function countryFromDemographics(
  experimentInfo: unknown,
): string | null {
  const responses = (
    experimentInfo as { responses?: { country_reside?: unknown } } | null
  )?.responses;
  return resolveCountryCodeFromName(responses?.country_reside);
}

// Rows assigned before countrySource existed were all tc-based.
async function isBesampleSession(sessionId: string): Promise<boolean> {
  const rows = await experiments.findAll({
    where: { sessionId, experimentType: 'besample-sampling' },
    attributes: ['experimentInfo'],
  });
  return rows.some(
    (row) =>
      (row.get('experimentInfo') as { countrySource?: string } | null)
        ?.countrySource !== 'geo',
  );
}

async function latestSelfReportedCountry(
  sessionId: string,
): Promise<string | null> {
  const row = await individuals.findOne({
    where: { sessionId, informationType: DEMOGRAPHICS_TYPES },
    attributes: ['experimentInfo'],
    order: [
      ['createdAt', 'DESC'],
      ['id', 'DESC'],
    ],
  });
  return row ? countryFromDemographics(row.get('experimentInfo')) : null;
}

function servedStatementIds(statementList: unknown): number[] {
  const list =
    typeof statementList === 'string'
      ? (JSON.parse(statementList) as unknown)
      : statementList;
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => Number((item as { id?: unknown } | null)?.id))
    .filter((id) => Number.isInteger(id));
}

async function creditExperiment(
  experimentId: number,
  sessionId: string,
  countryCode: string,
): Promise<void> {
  await db.sequelize.transaction(async (transaction) => {
    // Claiming the flag is atomic, so concurrent triggers credit once.
    const [claimed] = await experiments.update(
      { selfReportCredited: true },
      {
        where: { id: experimentId, finished: true, selfReportCredited: false },
        transaction,
      },
    );
    if (!claimed) return;

    const experiment = await experiments.findByPk(experimentId, {
      attributes: ['statementList'],
      transaction,
    });
    const served = servedStatementIds(experiment?.get('statementList'));
    if (served.length === 0) return;

    // Only statements the participant actually answered count.
    const answered = await answers.findAll({
      where: { sessionId, statementId: served },
      attributes: ['statementId'],
      transaction,
    });
    const answeredIds = new Set(
      answered.map((row) => row.get('statementId') as number),
    );

    // A statement this session already had credited through another
    // experiment counts once per participant.
    const otherCredited = await experiments.findAll({
      where: {
        sessionId,
        selfReportCredited: true,
        id: { [Op.ne]: experimentId },
      },
      attributes: ['statementList'],
      transaction,
    });
    for (const row of otherCredited) {
      for (const id of servedStatementIds(row.get('statementList'))) {
        answeredIds.delete(id);
      }
    }

    await incrementConfirmed(countryCode, [...answeredIds], transaction);
  });
}

// Called when an experiment finishes; uses the session's latest demographics.
export async function creditFinishedExperiment(
  experimentId: number,
  sessionId: string,
): Promise<void> {
  if (await isBesampleSession(sessionId)) return;
  const countryCode = await latestSelfReportedCountry(sessionId);
  if (!countryCode) return;
  await creditExperiment(experimentId, sessionId, countryCode);
}

// Called after demographics are saved; credits the session's finished,
// not-yet-credited experiments to the country just reported.
export async function creditOnDemographics(
  sessionId: string,
  experimentInfo: unknown,
): Promise<void> {
  const countryCode = countryFromDemographics(experimentInfo);
  if (!countryCode) return;
  if (await isBesampleSession(sessionId)) return;

  const uncredited = await experiments.findAll({
    where: { sessionId, finished: true, selfReportCredited: false },
    attributes: ['id'],
  });
  for (const row of uncredited) {
    await creditExperiment(row.get('id') as number, sessionId, countryCode);
  }
}
