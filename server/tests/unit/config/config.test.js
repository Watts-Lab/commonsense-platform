describe("config modules", () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.DB_DRIVER = "mysql";
  });

  it("exports expected database and session configuration", () => {
    const config = require("../../../config/config");
    expect(config.test).toMatchObject({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
    });
    expect(config.development.dialect).toBe("mysql");
    expect(config.dboptions).toHaveProperty("host");
    expect(config.dbSessionSchema.tableName).toBe("sessions");
  });

  it("exports experiments list", () => {
    const experiments = require("../../../survey/experiments");
    expect(Array.isArray(experiments)).toBe(true);
    expect(experiments.length).toBeGreaterThan(0);
  });
});
