// Helper for the one-off historical bootstrap (bootstrap-country-matrix.ts).
// The ISO country table itself lives in the runtime module
// src/survey/experiments/utils/country-codes.ts.

// Matches the c_code or tc key inside a urlParams string such as
// '{assignment_id:"...",c_code:"818",g_code:"null",language:"en",response_id:"..."}'.
// The (?:^|[{,]) guard ensures we match the *key* c_code/tc exactly, not any
// substring match inside an unrelated value.
const URL_PARAM_COUNTRY_CODE_RE = /(?:^|[{,])(?:c_code|tc):"([^"]*)"/;

// Pulls the Besample ISO 3166-1 numeric country code out of a urlParams
// string, if present. Returns null if absent/empty or no c_code/tc key.
export function extractCountryCodeFromUrlParams(
  urlParams: unknown,
): string | null {
  if (
    typeof urlParams !== 'string' ||
    urlParams.trim() === '' ||
    urlParams.trim() === '{}'
  ) {
    return null;
  }
  const match = URL_PARAM_COUNTRY_CODE_RE.exec(urlParams);
  return match ? match[1] : null;
}
