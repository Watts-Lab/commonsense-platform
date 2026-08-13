export {};

import axios from 'axios';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('meta controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.META_PIXEL_ID = 'pixel-1';
    process.env.META_ACCESS_TOKEN = 'token-1';
  });

  it('sends event with validated domain and optional user data', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { ok: true } } as any);
    const { sendMetaEvent } = await import('../../../controllers/meta');

    const result = await sendMetaEvent({
      eventName: 'Purchase',
      fbp: 'fbp-value',
      fbc: 'fbc-value',
      eventId: 'event-1',
      eventSourceUrl: 'https://commonsensicality.org/path',
      userAgent: 'jest-agent',
      clientIp: '127.0.0.1',
    });

    expect(result).toEqual({ ok: true });
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);

    const [url, rawPayload] = mockedAxios.post.mock.calls[0];
    const payload = rawPayload as any;
    expect(url).toContain('/pixel-1/events?access_token=token-1');
    expect(payload.data[0].event_name).toBe('Purchase');
    expect(payload.data[0].event_source_url).toBe(
      'https://commonsensicality.org',
    );
    expect(payload.data[0].user_data).toMatchObject({
      fbp: 'fbp-value',
      fbc: 'fbc-value',
      client_ip_address: '127.0.0.1',
      client_user_agent: 'jest-agent',
    });
  });

  it('falls back to default domain for invalid source URL', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { ok: true } } as any);
    const { sendMetaEvent } = await import('../../../controllers/meta');

    await sendMetaEvent({
      eventName: 'ViewContent',
      eventSourceUrl: 'not-a-valid-url',
    });

    const [, rawPayload] = mockedAxios.post.mock.calls[0];
    const payload = rawPayload as any;
    expect(payload.data[0].event_source_url).toBe(
      'https://commonsensicality.org',
    );
  });

  it('throws when required env vars are missing', async () => {
    delete process.env.META_PIXEL_ID;
    delete process.env.META_ACCESS_TOKEN;

    const { sendMetaEvent } = await import('../../../controllers/meta');

    await expect(sendMetaEvent({ eventName: 'Lead' })).rejects.toThrow(
      'META_PIXEL_ID and META_ACCESS_TOKEN must be set',
    );
  });
});
