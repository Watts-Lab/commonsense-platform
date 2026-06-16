export {};

const verifyMock = jest.fn();
const findOneMock = jest.fn();

jest.mock('jsonwebtoken', () => ({
  __esModule: true,
  default: {
    verify: (...args: unknown[]) => verifyMock(...args),
  },
}));

jest.mock('../../../db/models', () => ({
  users: {
    findOne: (...args: unknown[]) => findOneMock(...args),
  },
}));

describe('authhelper', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  it('throws when no token is provided', async () => {
    const { getUserIdFromToken } =
      await import('../../../controllers/authhelper');
    await expect(getUserIdFromToken('')).rejects.toThrow('No token provided');
  });

  it('throws on invalid token', async () => {
    verifyMock.mockImplementationOnce(
      (_token: string, _secret: string, cb: Function) =>
        cb(new Error('bad token')),
    );
    const { getUserIdFromToken } =
      await import('../../../controllers/authhelper');
    await expect(getUserIdFromToken('bad')).rejects.toThrow('Invalid token');
  });

  it('throws when user is not found', async () => {
    verifyMock.mockImplementationOnce(
      (_token: string, _secret: string, cb: Function) =>
        cb(null, { email: 'missing@example.com' }),
    );
    findOneMock.mockResolvedValueOnce(null);

    const { getUserIdFromToken } =
      await import('../../../controllers/authhelper');
    await expect(getUserIdFromToken('ok-token')).rejects.toThrow(
      'User not found',
    );
  });

  it('returns user id and session id for valid token', async () => {
    verifyMock.mockImplementation(
      (_token: string, _secret: string, cb: Function) =>
        cb(null, { email: 'user@example.com' }),
    );
    findOneMock.mockResolvedValue({
      get: (key: string) => (key === 'id' ? 42 : 'session-42'),
    });

    const { getUserIdFromToken, getSessionIdFromToken } =
      await import('../../../controllers/authhelper');

    await expect(getUserIdFromToken('good-token')).resolves.toBe(42);
    await expect(getSessionIdFromToken('good-token')).resolves.toBe(
      'session-42',
    );
  });
});
