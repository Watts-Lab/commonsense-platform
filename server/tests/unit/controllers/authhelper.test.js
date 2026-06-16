const mockVerify = jest.fn();
const mockFindOne = jest.fn();

jest.mock("jsonwebtoken", () => ({
  verify: (...args) => mockVerify(...args),
}));

jest.mock("../../../models", () => ({
  users: {
    findOne: (...args) => mockFindOne(...args),
  },
}));

describe("authhelper", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  it("throws when no token is provided", async () => {
    const { getUserIdFromToken } = require("../../../controllers/authhelper");
    await expect(getUserIdFromToken("")).rejects.toThrow("No token provided");
  });

  it("throws on invalid token", async () => {
    mockVerify.mockImplementationOnce((_token, _secret, cb) => cb(new Error("bad token")));
    const { getUserIdFromToken } = require("../../../controllers/authhelper");
    await expect(getUserIdFromToken("bad")).rejects.toThrow("Invalid token");
  });

  it("throws when user is not found", async () => {
    mockVerify.mockImplementationOnce((_token, _secret, cb) => cb(null, { email: "missing@example.com" }));
    mockFindOne.mockResolvedValueOnce(null);

    const { getUserIdFromToken } = require("../../../controllers/authhelper");
    await expect(getUserIdFromToken("ok-token")).rejects.toThrow("User not found");
  });

  it("returns user id and session id for valid token", async () => {
    mockVerify.mockImplementation((_token, _secret, cb) => cb(null, { email: "user@example.com" }));
    mockFindOne.mockResolvedValue({ id: 42, sessionId: "session-42" });

    const { getUserIdFromToken, getSessionIdFromToken } = require("../../../controllers/authhelper");

    await expect(getUserIdFromToken("good-token")).resolves.toBe(42);
    await expect(getSessionIdFromToken("good-token")).resolves.toBe("session-42");
  });
});
