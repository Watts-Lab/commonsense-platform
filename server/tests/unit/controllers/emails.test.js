const mockSendMail = jest.fn();

jest.mock("nodemailer", () => ({
  createTransport: jest.fn(() => ({ sendMail: mockSendMail })),
}));

jest.mock("@aws-sdk/client-sesv2", () => ({
  SESv2Client: jest.fn(),
  SendEmailCommand: jest.fn(),
}));

describe("emails controller", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env.SITE_URL = "https://commonsensicality.org";
  });

  it("send_magic_link returns success for signup email", async () => {
    process.env.NODE_ENV = "production";
    mockSendMail.mockResolvedValueOnce({});

    const { send_magic_link } = require("../../../controllers/emails");
    const result = await send_magic_link(
      "user@example.com",
      "token1",
      "signup",
    );

    expect(result).toEqual({ ok: true, message: "email sent" });
    expect(mockSendMail).toHaveBeenCalledTimes(1);
    expect(mockSendMail.mock.calls[0][0]).toMatchObject({
      to: "user@example.com",
      subject: "Sign Up Common Sense Platform",
    });
    expect(mockSendMail.mock.calls[0][0].html).toContain(
      "https://commonsensicality.org/login/user@example.com/token1",
    );
  });

  it("send_magic_link uses local URL in development", async () => {
    process.env.NODE_ENV = "development";
    mockSendMail.mockResolvedValueOnce({});

    const { send_magic_link } = require("../../../controllers/emails");
    await send_magic_link("dev@example.com", "dev-token");

    expect(mockSendMail.mock.calls[0][0].html).toContain(
      "http://localhost:5173/login/dev@example.com/dev-token",
    );
  });

  it("send_magic_link returns failure when transporter errors", async () => {
    mockSendMail.mockRejectedValueOnce(new Error("smtp down"));
    const { send_magic_link } = require("../../../controllers/emails");

    const result = await send_magic_link("user@example.com", "token2");
    expect(result).toEqual({ ok: false, message: "smtp down" });
  });

  it("send_report returns success and failure states", async () => {
    mockSendMail.mockResolvedValueOnce({});
    mockSendMail.mockRejectedValueOnce(new Error("report failed"));

    const { send_report } = require("../../../controllers/emails");

    await expect(
      send_report("team@example.com", "feedback", "bug"),
    ).resolves.toEqual({
      ok: true,
      message: "email sent",
    });
    await expect(
      send_report("team@example.com", "feedback", "bug"),
    ).resolves.toEqual({
      ok: false,
      message: "report failed",
    });
  });
});
