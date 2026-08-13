import axios from 'axios';

const VALID_DOMAINS = [
  'commonsense.seas.upenn.edu',
  'commonsensicality.org',
  'commonsensicality.com',
];

interface MetaEventParams {
  eventName: string;
  fbp?: string;
  fbc?: string;
  eventId?: string | number;
  eventSourceUrl?: string;
  userAgent?: string;
  clientIp?: string;
}

export async function sendMetaEvent({
  eventName,
  fbp,
  fbc,
  eventId,
  eventSourceUrl,
  userAgent,
  clientIp,
}: MetaEventParams): Promise<unknown> {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;
  const apiVersion = 'v22.0';

  if (!pixelId || !accessToken) {
    throw new Error('META_PIXEL_ID and META_ACCESS_TOKEN must be set');
  }

  let validatedUrl = 'https://commonsensicality.org';
  if (eventSourceUrl) {
    try {
      const parsed = new URL(eventSourceUrl);
      if (VALID_DOMAINS.includes(parsed.hostname)) {
        validatedUrl = parsed.origin;
      }
    } catch {
      validatedUrl = 'https://commonsensicality.org';
    }
  }

  const user_data: Record<string, string> = {};
  if (fbp) user_data.fbp = fbp;
  if (fbc) user_data.fbc = fbc;
  if (clientIp) user_data.client_ip_address = clientIp;
  if (userAgent) user_data.client_user_agent = userAgent;

  const event: Record<string, unknown> = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    action_source: 'website',
    event_source_url: validatedUrl,
    user_data,
    custom_data: {},
  };

  if (eventId) {
    event.event_id = eventId;
  }

  const response = await axios.post(
    `https://graph.facebook.com/${apiVersion}/${pixelId}/events?access_token=${accessToken}`,
    { data: [event] },
    { headers: { 'Content-Type': 'application/json' } },
  );

  return response.data;
}
