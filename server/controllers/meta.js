const axios = require("axios");

const VALID_DOMAINS = [
  "commonsense.seas.upenn.edu",
  "commonsensicality.org",
  "commonsensicality.com",
];

/**
 * Send an event to Meta Conversions API (CAPI)
 * @param {Object} params - Event parameters
 * @param {string} params.eventName - Event name (e.g., "SurveyCompleted")
 * @param {string} [params.fbp] - Meta browser ID (_fbp cookie)
 * @param {string} [params.fbc] - Meta click ID (_fbc cookie)
 * @param {string} [params.eventId] - Unique ID for deduplication
 * @param {string} [params.eventSourceUrl] - URL of the page triggering the event
 * @param {string} [params.userAgent] - Client's User-Agent header
 * @param {string} [params.clientIp] - Client's IP address
 */
async function sendMetaEvent({
  eventName,
  fbp,
  fbc,
  eventId,
  eventSourceUrl,
  userAgent,
  clientIp,
}) {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;
  const apiVersion = "v22.0";

  if (!pixelId || !accessToken) {
    throw new Error("META_PIXEL_ID and META_ACCESS_TOKEN must be set");
  }

  // Validate the event source domain
  let validatedUrl = "https://commonsensicality.org"; // default fallback
  if (eventSourceUrl) {
    try {
      const parsed = new URL(eventSourceUrl);
      if (VALID_DOMAINS.includes(parsed.hostname)) {
        validatedUrl = parsed.origin;
      } else {
        console.warn(
          `[sendMetaEvent] Unknown domain in event_source_url: ${parsed.hostname}`
        );
      }
    } catch {
      console.warn("[sendMetaEvent] Invalid eventSourceUrl format");
    }
  }

  // Build user_data
  const user_data = {};
  if (fbp) user_data.fbp = fbp;
  if (fbc) user_data.fbc = fbc;
  if (clientIp) user_data.client_ip_address = clientIp;
  if (userAgent) user_data.client_user_agent = userAgent;

  // Build main event
  const event = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    action_source: "website",
    event_source_url: validatedUrl,
    user_data,
    custom_data: {},
  };

  if (eventId) event.event_id = eventId;

  try {
    const response = await axios.post(
      `https://graph.facebook.com/${apiVersion}/${pixelId}/events?access_token=${accessToken}`,
      { data: [event] },
      { headers: { "Content-Type": "application/json" } }
    );

    console.log("Meta CAPI event sent successfully:", response.data);
    return response.data;
  } catch (err) {
    console.error(
      "Error sending Meta CAPI event:",
      err.response?.data || err.message
    );
    throw err;
  }
}

module.exports = { sendMetaEvent };
