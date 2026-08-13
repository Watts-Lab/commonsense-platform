export {};

describe('config modules', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.NODE_ENV = 'test';
    process.env.DB_DRIVER = 'mysql';
  });

  it('buildSessionConfig sets secure cookie flags by environment', async () => {
    const { buildSessionConfig } =
      await import('../../../config/sessions.config');

    process.env.NODE_ENV = 'production';
    expect(buildSessionConfig().cookie).toMatchObject({
      sameSite: 'none',
      secure: true,
    });

    process.env.NODE_ENV = 'development';
    expect(buildSessionConfig().cookie).toMatchObject({
      sameSite: 'lax',
      secure: false,
    });
  });

  it('exports expected database and session configuration', async () => {
    const { database, dboptions, dbSessionSchema } =
      await import('../../../config/config');

    expect(database.test).toMatchObject({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });
    expect(database.development.dialect).toBe('mysql');
    expect(dboptions).toHaveProperty('host');
    expect(dbSessionSchema.tableName).toBe('sessions');
  });

  it('exports cli sequelize config object', async () => {
    const module = await import('../../../config/sequelize.config');
    expect(module.default).toHaveProperty('development');
    expect(module.default).toHaveProperty('test');
    expect(module.default).toHaveProperty('production');
  });

  it('exports experiment list', async () => {
    const module = await import('../../../survey/experiments');
    expect(Array.isArray(module.default)).toBe(true);
    expect(
      module.default.map((experiment) => experiment.experimentName),
    ).toEqual(
      expect.arrayContaining([
        'daily-experiment',
        'design-point',
        'design-design_point-old-statements',
      ]),
    );
  });
});
