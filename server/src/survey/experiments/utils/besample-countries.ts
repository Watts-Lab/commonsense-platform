// The 16 countries Besample can currently recruit from (see
// commonsense-data/.scripts/besample/sampling_20260723/besample_costs.csv).
// This scopes both the recruitment strategy's R(i) computation and which
// countries' ratings get tracked in `statementcountryratings` at all -- a
// country outside this list can't be recruited via Besample this round, so
// counting toward it would only distort the "cheapest to finish" ranking.
//
// Codes are ISO 3166-1 numeric, zero-padded to 3 digits -- the same
// convention the `tc` URL param and `countryblocks.countryCode` already use.
// Names match the spelling used by @watts-lab/surveys' demographics country
// list (verified for this set: no accented/alternate-name variants here).
export const BESAMPLE_COUNTRIES = [
  { code: '032', name: 'Argentina' },
  { code: '076', name: 'Brazil' },
  { code: '818', name: 'Egypt' },
  { code: '288', name: 'Ghana' },
  { code: '356', name: 'India' },
  { code: '360', name: 'Indonesia' },
  { code: '392', name: 'Japan' },
  { code: '398', name: 'Kazakhstan' },
  { code: '404', name: 'Kenya' },
  { code: '484', name: 'Mexico' },
  { code: '566', name: 'Nigeria' },
  { code: '586', name: 'Pakistan' },
  { code: '608', name: 'Philippines' },
  { code: '710', name: 'South Africa' },
  { code: '792', name: 'Turkey' },
  { code: '804', name: 'Ukraine' },
] as const;

const CODE_TO_NAME = new Map<string, string>(
  BESAMPLE_COUNTRIES.map(({ code, name }) => [code, name]),
);
const NAME_TO_CODE = new Map<string, string>(
  BESAMPLE_COUNTRIES.map(({ code, name }) => [name, code]),
);

export const BESAMPLE_COUNTRY_CODES: readonly string[] = BESAMPLE_COUNTRIES.map(
  ({ code }) => code,
);

export function isTrackedCountryCode(code: string): boolean {
  return CODE_TO_NAME.has(code);
}

// Resolves the `tc` URL param (a raw, possibly-unpadded ISO 3166-1 numeric
// code, e.g. "76") to one of the 16 tracked codes. Returns null if absent or
// not one of the 16 -- callers should treat that as "not trackable this
// round", not as an error.
export function resolveCountryCodeFromTc(tc: unknown): string | null {
  if (tc === undefined || tc === null || tc === '') return null;
  const code = String(tc).trim().padStart(3, '0');
  return isTrackedCountryCode(code) ? code : null;
}

// Resolves a self-reported `country_reside` demographic value to one of the
// 16 tracked codes. Returns null if it doesn't match one of the 16 --
// self-reporting a country outside the tracked set is expected and common,
// not an error.
export function resolveCountryCodeFromName(name: unknown): string | null {
  if (typeof name !== 'string') return null;
  return NAME_TO_CODE.get(name.trim()) ?? null;
}
