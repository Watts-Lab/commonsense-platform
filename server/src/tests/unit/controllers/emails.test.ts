export {};

const sendMailMock = jest.fn();

jest.mock('nodemailer', () => ({
  __esModule: true,
  default: {
    createTransport: jest.fn(() => ({
      sendMail: sendMailMock,
    })),
  },
}));

describe('emails controller', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env.SITE_URL = 'https://commonsensicality.org';
  });

  it('send_magic_link returns success for signup email', async () => {
    process.env.NODE_ENV = 'production';
    sendMailMock.mockResolvedValueOnce({});

    const { send_magic_link } = await import('../../../controllers/emails');
    const result = await send_magic_link(
      'user@example.com',
      'token1',
      'signup',
    );

    expect(result).toEqual({ ok: true, message: 'email sent' });
    expect(sendMailMock).toHaveBeenCalledTimes(1);
    expect(sendMailMock.mock.calls[0][0]).toMatchObject({
      to: 'user@example.com',
      subject: 'Sign Up Common Sense Platform',
    });
    expect(sendMailMock.mock.calls[0][0].html).toContain(
      'https://commonsensicality.org/login/user@example.com/token1',
    );
  });

  it('send_magic_link uses local URL in development', async () => {
    process.env.NODE_ENV = 'development';
    sendMailMock.mockResolvedValueOnce({});

    const { send_magic_link } = await import('../../../controllers/emails');
    await send_magic_link('dev@example.com', 'dev-token');

    expect(sendMailMock.mock.calls[0][0].html).toContain(
      'http://localhost:5173/login/dev@example.com/dev-token',
    );
  });

  it('send_magic_link returns failure when transporter errors', async () => {
    sendMailMock.mockRejectedValueOnce(new Error('smtp down'));

    const { send_magic_link } = await import('../../../controllers/emails');
    const result = await send_magic_link('user@example.com', 'token2');

    expect(result).toEqual({ ok: false, message: 'smtp down' });
  });

  it('send_report returns success and failure states', async () => {
    sendMailMock.mockResolvedValueOnce({});
    sendMailMock.mockRejectedValueOnce(new Error('report failed'));

    const { send_report } = await import('../../../controllers/emails');

    await expect(
      send_report('team@example.com', 'feedback body', 'bug'),
    ).resolves.toEqual({ ok: true, message: 'email sent' });

    await expect(
      send_report('team@example.com', 'feedback body', 'bug'),
    ).resolves.toEqual({ ok: false, message: 'report failed' });
  });
});
