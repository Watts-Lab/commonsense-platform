import db from '../../db/models';
import { main } from '../../../scripts/bootstrap-country-matrix';

const STATEMENT_FIXTURE = {
  statementSource: 'test',
  origLanguage: 'en',
};

describe('bootstrap-country-matrix', () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  it('resolves self-reported and Besample-overridden countries, skips untracked/unpublished, and is idempotent on re-run', async () => {
    // 5 statements: 1,2,5 published, 5 will be excluded via the published filter
    // being answered by a tracked-country session; 3 published (Egypt via
    // override); 4 published but only answered by an untracked-country session.
    const created = await db.statements.bulkCreate([
      { ...STATEMENT_FIXTURE, statement: 'S1', published: true },
      { ...STATEMENT_FIXTURE, statement: 'S2', published: true },
      { ...STATEMENT_FIXTURE, statement: 'S3', published: true },
      { ...STATEMENT_FIXTURE, statement: 'S4', published: true },
      { ...STATEMENT_FIXTURE, statement: 'S5 (unpublished)', published: false },
    ]);
    const [s1, s2, s3, s4, s5] = created.map((row) => row.get('id') as number);

    // --- Scenario A: consistent-ID cohort, self-report Brazil, no Besample code.
    const brazilSession = 'smoke-consistent-brazil';
    await db.individuals.bulkCreate([
      { sessionId: brazilSession, informationType: 'CRT', experimentInfo: {} },
      {
        sessionId: brazilSession,
        informationType: 'rmeTen',
        experimentInfo: {},
      },
      {
        sessionId: brazilSession,
        informationType: 'demographics',
        experimentInfo: { responses: { country_reside: 'Brazil' } },
      },
    ]);
    await db.answers.bulkCreate(
      [s1, s2, s5].map((statementId) => ({
        sessionId: brazilSession,
        statementId,
        I_agree: true,
        I_agree_reason: 'r',
        others_agree: true,
        others_agree_reason: 'r',
        perceived_commonsense: true,
      })),
    );

    // --- Scenario B: self-report France (untracked), but a Besample `tc`
    // code resolves to Egypt -> override wins.
    const overrideSession = 'smoke-override-egypt';
    await db.individuals.bulkCreate([
      {
        sessionId: overrideSession,
        informationType: 'CRT',
        experimentInfo: {},
      },
      {
        sessionId: overrideSession,
        informationType: 'rmeTen',
        experimentInfo: {},
      },
      {
        sessionId: overrideSession,
        informationType: 'demographics',
        experimentInfo: { responses: { country_reside: 'France' } },
      },
    ]);
    await db.experiments.create({
      sessionId: overrideSession,
      experimentId: 'x',
      experimentType: 'default',
      urlParams: '{tc:"818"}',
      finished: true,
    });
    await db.answers.create({
      sessionId: overrideSession,
      statementId: s3,
      I_agree: true,
      I_agree_reason: 'r',
      others_agree: true,
      others_agree_reason: 'r',
      perceived_commonsense: true,
    });

    // --- Scenario C: self-report France (untracked), no Besample code ->
    // not counted toward any tracked country.
    const untrackedSession = 'smoke-untracked';
    await db.individuals.bulkCreate([
      {
        sessionId: untrackedSession,
        informationType: 'CRT',
        experimentInfo: {},
      },
      {
        sessionId: untrackedSession,
        informationType: 'rmeTen',
        experimentInfo: {},
      },
      {
        sessionId: untrackedSession,
        informationType: 'demographics',
        experimentInfo: { responses: { country_reside: 'France' } },
      },
    ]);
    await db.answers.create({
      sessionId: untrackedSession,
      statementId: s4,
      I_agree: true,
      I_agree_reason: 'r',
      others_agree: true,
      others_agree_reason: 'r',
      perceived_commonsense: true,
    });

    await main();

    const rows = await db.statementcountryratings.findAll({ raw: true });
    const byKey = new Map(
      (
        rows as unknown as Array<{
          statementId: number;
          countryCode: string;
          confirmedCount: number;
        }>
      ).map((row) => [
        `${row.statementId}:${row.countryCode}`,
        row.confirmedCount,
      ]),
    );

    // Brazil: s1 and s2 counted, s5 excluded (unpublished).
    expect(byKey.get(`${s1}:076`)).toBe(1);
    expect(byKey.get(`${s2}:076`)).toBe(1);
    expect(byKey.has(`${s5}:076`)).toBe(false);

    // Egypt: s3 counted via override, despite self-reporting France.
    expect(byKey.get(`${s3}:818`)).toBe(1);

    // Untracked session's statement never appears under any tracked country.
    for (const code of [
      '032',
      '076',
      '818',
      '288',
      '356',
      '360',
      '392',
      '398',
      '404',
      '484',
      '566',
      '586',
      '608',
      '710',
      '792',
      '804',
    ]) {
      expect(byKey.has(`${s4}:${code}`)).toBe(false);
    }

    // Re-running is idempotent: same counts, not doubled.
    await main();
    const rowsAfterRerun = await db.statementcountryratings.findAll({
      raw: true,
    });
    const rerunByKey = new Map(
      (
        rowsAfterRerun as unknown as Array<{
          statementId: number;
          countryCode: string;
          confirmedCount: number;
        }>
      ).map((row) => [
        `${row.statementId}:${row.countryCode}`,
        row.confirmedCount,
      ]),
    );
    expect(rerunByKey.get(`${s1}:076`)).toBe(1);
    expect(rerunByKey.get(`${s3}:818`)).toBe(1);
    expect(rowsAfterRerun.length).toBe(rows.length);
  });
});
