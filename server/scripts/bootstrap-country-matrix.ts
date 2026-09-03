/*
 * One-off historical bootstrap for `statementcountryratings` -- the live
 * n(i,j) matrix (ratings per statement x Besample-recruitable country) that
 * drives the row-priority dynamic-frontier recruitment strategy (see
 * commonsense-data/.scripts/besample/sampling_20260723/strategy.md).
 *
 * Ports two pieces of logic from commonsense-data/.scripts/visualize/update-data.py,
 * applied against THIS repo's own live tables (not commonsense-data's CSVs,
 * which are only refreshed once or twice a day):
 *
 *   1. Matching: a historical bug assigned different sessionIds to a single
 *      participant's answers/CRT/RME/demographics records. Sessions affected
 *      by the bug are pre-matched in the static, no-longer-updated
 *      all_matches_hungarian.csv (Hungarian-algorithm output, keyed by the
 *      "answers" sessionId). Sessions created after the fix already share one
 *      consistent sessionId across all four record types -- those form the
 *      "consistent ID" cohort, computed here directly from the live tables.
 *
 *   2. Besample country override: a participant's self-reported
 *      demographics `country_reside` is overridden by their Besample
 *      recruitment code (`tc`/`c_code` in `experiments.urlParams`) whenever
 *      that code maps to a recognized country -- even if the two disagree.
 *
 * Only ratings resolving to one of the 16 Besample-recruitable countries
 * (see besample-countries.ts) are written, and only for `published`
 * statements.
 *
 * This is a full, idempotent recompute (not an incremental append): it always
 * replaces every existing statementcountryratings row for the 16 tracked
 * countries from scratch, so it's safe to re-run if something drifts. It is
 * NOT part of the automatic migrate:deploy path -- run it manually:
 *
 *   npm run bootstrap:country-matrix
 */

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import db, {
  answers,
  individuals,
  experiments,
  statements,
  statementcountryratings,
} from '../src/db/models';
import {
  BESAMPLE_COUNTRY_CODES,
  resolveCountryCodeFromName,
} from '../src/survey/experiments/utils/besample-countries';
import {
  extractCountryCodeFromUrlParams,
  codeToCountryName,
} from './lib/iso-country-codes';

interface HungarianRow {
  demo: string;
  crt: string;
  rme: string;
  answers: string;
}

interface MatchedGroup {
  answersId: string;
  crtId: string;
  rmeId: string;
  demoId: string;
}

function loadHungarianMatches(): HungarianRow[] {
  const csvPath = path.resolve(
    __dirname,
    '../src/db/seeds/all_matches_hungarian.csv',
  );
  const content = fs.readFileSync(csvPath, 'utf8');
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
  }) as Array<Record<string, string>>;
  return records.map((row) => ({
    demo: row.demo,
    crt: row.crt,
    rme: row.rme,
    answers: row.answers,
  }));
}

export async function main(): Promise<void> {
  console.log('='.repeat(80));
  console.log('Bootstrapping statementcountryratings from historical data...');

  const hungarianMatches = loadHungarianMatches();
  console.log(`Loaded ${hungarianMatches.length} Hungarian-matched groups.`);

  console.log('\nLoading individuals (CRT / RME / demographics)...');
  // NOT raw: `experimentInfo` is a JSON column, and under some dialects
  // (SQLite in particular) `raw: true` returns it as an unparsed string
  // rather than an object -- go through model instances + `.get()` instead,
  // matching how JSON columns are read everywhere else in this codebase.
  const individualRows = await individuals.findAll({
    attributes: ['sessionId', 'informationType', 'experimentInfo', 'createdAt'],
  });

  const crtSessionIds = new Set<string>();
  const rmeSessionIds = new Set<string>();
  // Keep the LATEST row per sessionId (mirrors update-data.py's sort by
  // createdAt + drop_duplicates(keep='last')).
  const demoRowsByLatest = new Map<
    string,
    { createdAt: Date; countryReside: string | null }
  >();

  for (const row of individualRows) {
    const sessionId = row.get('sessionId') as string | null;
    const informationType = row.get('informationType') as string;
    if (!sessionId) continue;
    if (informationType === 'CRT') {
      crtSessionIds.add(sessionId);
    } else if (informationType === 'rmeTen') {
      rmeSessionIds.add(sessionId);
    } else if (
      informationType === 'demographics' ||
      informationType === 'demographicsLongInternational'
    ) {
      const createdAt = row.get('createdAt') as Date;
      const existing = demoRowsByLatest.get(sessionId);
      if (!existing || createdAt > existing.createdAt) {
        const info = row.get('experimentInfo') as
          { responses?: { country_reside?: string } } | null | undefined;
        demoRowsByLatest.set(sessionId, {
          createdAt,
          countryReside: info?.responses?.country_reside ?? null,
        });
      }
    }
  }
  const demoSessionIds = new Set(demoRowsByLatest.keys());
  console.log(
    `  CRT sessions: ${crtSessionIds.size}, RME sessions: ${rmeSessionIds.size}, ` +
      `demographics sessions: ${demoSessionIds.size}`,
  );

  console.log('\nLoading answers (sessionId, statementId only)...');
  const answerRows = (await answers.findAll({
    attributes: ['sessionId', 'statementId'],
    raw: true,
  })) as unknown as Array<{ sessionId: string; statementId: number | null }>;

  const answersBySession = new Map<string, Set<number>>();
  const answersSessionIds = new Set<string>();
  for (const row of answerRows) {
    if (!row.sessionId || row.statementId === null) continue;
    answersSessionIds.add(row.sessionId);
    if (!answersBySession.has(row.sessionId)) {
      answersBySession.set(row.sessionId, new Set());
    }
    answersBySession.get(row.sessionId)!.add(row.statementId);
  }
  console.log(`  Distinct answer sessions: ${answersSessionIds.size}`);

  console.log(
    '\nLoading experiments (sessionId, urlParams) for Besample country overrides...',
  );
  const experimentRows = (await experiments.findAll({
    attributes: ['sessionId', 'urlParams', 'createdAt'],
    raw: true,
    order: [['createdAt', 'ASC']],
  })) as unknown as Array<{
    sessionId: string;
    urlParams: unknown;
    createdAt: Date;
  }>;

  // First extractable country code per session, in ascending createdAt order
  // (mirrors update-data.py's drop_duplicates(keep='first') after sorting).
  const besampleCodeBySession = new Map<string, string>();
  for (const row of experimentRows) {
    if (!row.sessionId || besampleCodeBySession.has(row.sessionId)) continue;
    const code = extractCountryCodeFromUrlParams(row.urlParams);
    if (code) besampleCodeBySession.set(row.sessionId, code);
  }

  // --- Build matched groups: Hungarian file + "consistent ID" cohort -------
  const commonIds = [...crtSessionIds].filter(
    (id) =>
      rmeSessionIds.has(id) &&
      demoSessionIds.has(id) &&
      answersSessionIds.has(id),
  );

  const hungarianIdsAnyRole = new Set<string>();
  for (const row of hungarianMatches) {
    hungarianIdsAnyRole.add(row.answers);
    hungarianIdsAnyRole.add(row.crt);
    hungarianIdsAnyRole.add(row.rme);
    hungarianIdsAnyRole.add(row.demo);
  }
  const overlap = commonIds.filter((id) => hungarianIdsAnyRole.has(id));
  if (overlap.length > 0) {
    throw new Error(
      `Sanity check failed: ${overlap.length} session id(s) appear both in ` +
        `the Hungarian-matched file and the consistent-ID cohort (e.g. ` +
        `"${overlap[0]}"). Aborting -- this would double-count a person.`,
    );
  }

  const matchedGroups: MatchedGroup[] = [
    ...hungarianMatches.map((row) => ({
      answersId: row.answers,
      crtId: row.crt,
      rmeId: row.rme,
      demoId: row.demo,
    })),
    ...commonIds.map((id) => ({
      answersId: id,
      crtId: id,
      rmeId: id,
      demoId: id,
    })),
  ];
  console.log(
    `\nMatched groups: ${matchedGroups.length} (${hungarianMatches.length} via ` +
      `Hungarian matching, ${commonIds.length} via consistent ID).`,
  );

  // --- Published statement ids (only these are recruitment-eligible) -------
  const publishedRows = (await statements.findAll({
    where: { published: true },
    attributes: ['id'],
    raw: true,
  })) as unknown as Array<{ id: number }>;
  const publishedIds = new Set(publishedRows.map((row) => row.id));

  // --- Resolve each matched group's country and tally ratings --------------
  const tally = new Map<string, Map<number, number>>(); // countryCode -> statementId -> count
  for (const code of BESAMPLE_COUNTRY_CODES) tally.set(code, new Map());

  let trackedGroups = 0;
  let overriddenGroups = 0;

  for (const group of matchedGroups) {
    const besampleRawCode = besampleCodeBySession.get(group.answersId);
    const besampleCountryName = besampleRawCode
      ? codeToCountryName(besampleRawCode)
      : null;
    // A valid Besample code always overrides self-report, even if it maps to
    // a country we don't track; an invalid/unmappable code (or none at all)
    // falls back to self-report, exactly like update-data.py's override_mask.
    const finalCountryName =
      besampleCountryName ??
      demoRowsByLatest.get(group.demoId)?.countryReside ??
      null;

    if (besampleCountryName) overriddenGroups += 1;
    if (!finalCountryName) continue;

    const trackedCode = resolveCountryCodeFromName(finalCountryName);
    if (!trackedCode) continue;

    const statementIds = answersBySession.get(group.answersId);
    if (!statementIds || statementIds.size === 0) continue;

    trackedGroups += 1;
    const countryTally = tally.get(trackedCode)!;
    for (const statementId of statementIds) {
      if (!publishedIds.has(statementId)) continue;
      countryTally.set(statementId, (countryTally.get(statementId) ?? 0) + 1);
    }
  }

  console.log(
    `\n${trackedGroups} matched groups resolved to one of the 16 tracked ` +
      `countries (${overriddenGroups} had a valid Besample recruitment code).`,
  );

  // --- Idempotent full recompute: replace all tracked-country rows ---------
  await statementcountryratings.destroy({
    where: { countryCode: BESAMPLE_COUNTRY_CODES as unknown as string[] },
  });

  const rows: Array<{
    statementId: number;
    countryCode: string;
    confirmedCount: number;
  }> = [];
  for (const [countryCode, statementCounts] of tally) {
    for (const [statementId, count] of statementCounts) {
      rows.push({ statementId, countryCode, confirmedCount: count });
    }
    console.log(
      `  ${countryCode}: ${statementCounts.size} statement(s) with >=1 rating`,
    );
  }
  await statementcountryratings.bulkCreate(rows);

  console.log(`\nWrote ${rows.length} statementcountryratings rows.`);
  console.log('Done.');
}

if (require.main === module) {
  main()
    .then(() => db.sequelize.close())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Bootstrap failed:', err);
      process.exit(1);
    });
}
