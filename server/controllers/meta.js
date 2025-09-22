const bizSdk = require("facebook-nodejs-business-sdk");
const { ServerEvent, EventRequest, UserData, CustomData } = bizSdk;

/**
 * Send an event to Meta Conversions API using facebook-nodejs-business-sdk
 * @param {string} eventName - Standard or custom event name (e.g., "SurveyCompleted")
 * @param {string} fbp - _fbp cookie value (optional)
 * @param {string} fbc - _fbc cookie value (optional)
 * @param {string} eventId - Unique event ID for deduplication (optional)
 */
async function sendMetaEvent({ eventName, fbp, fbc, eventId }) {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;
  bizSdk.FacebookAdsApi.init(accessToken);

  const userData = new UserData()
    .setFbp(fbp || undefined)
    .setFbc(fbc || undefined);

  const customData = new CustomData();

  const serverEvent = new ServerEvent()
    .setEventName(eventName)
    .setEventTime(Math.floor(Date.now() / 1000))
    .setUserData(userData)
    .setCustomData(customData)
    .setEventId(eventId || undefined)
    .setActionSource("website");

  const eventsData = [serverEvent];
  const eventRequest = new EventRequest(accessToken, pixelId).setEvents(
    eventsData
  );

  try {
    const result = await eventRequest.execute();
    return result;
  } catch (err) {
    console.error("Error sending Meta CAPI event:", err);
    throw err;
  }
}

module.exports = { sendMetaEvent };
