import {
  ALL_COUNTRY_CODES,
  codeToCountryName,
  isKnownCountryCode,
  resolveCountryCodeFromGeoHeader,
  resolveCountryCodeFromName,
  resolveCountryCodeFromTc,
  resolveCountryFromRequest,
} from '../../../survey/experiments/utils/country-codes';

describe('country-codes', () => {
  it('covers every ISO 3166-1 country with unique 3-digit codes', () => {
    expect(ALL_COUNTRY_CODES).toHaveLength(249);
    expect(new Set(ALL_COUNTRY_CODES).size).toBe(249);
    for (const code of ALL_COUNTRY_CODES) {
      expect(code).toMatch(/^\d{3}$/);
    }
  });

  it('isKnownCountryCode accepts any ISO country, not just Besample ones', () => {
    expect(isKnownCountryCode('818')).toBe(true); // Egypt
    expect(isKnownCountryCode('250')).toBe(true); // France
    expect(isKnownCountryCode('999')).toBe(false);
  });

  describe('resolveCountryCodeFromTc', () => {
    it('zero-pads and validates the code', () => {
      expect(resolveCountryCodeFromTc('76')).toBe('076'); // Brazil
      expect(resolveCountryCodeFromTc(' 250 ')).toBe('250'); // France
      expect(resolveCountryCodeFromTc(840)).toBe('840'); // United States
    });

    it('returns null for absent, placeholder or malformed codes', () => {
      expect(resolveCountryCodeFromTc(undefined)).toBeNull();
      expect(resolveCountryCodeFromTc(null)).toBeNull();
      expect(resolveCountryCodeFromTc('')).toBeNull();
      expect(resolveCountryCodeFromTc('999')).toBeNull(); // Besample placeholder
      expect(resolveCountryCodeFromTc('0818')).toBeNull();
      expect(resolveCountryCodeFromTc('EG')).toBeNull();
    });
  });

  describe('resolveCountryCodeFromGeoHeader', () => {
    it('maps any alpha-2 country, case-insensitively', () => {
      expect(resolveCountryCodeFromGeoHeader('br')).toBe('076');
      expect(resolveCountryCodeFromGeoHeader('DE')).toBe('276');
      expect(resolveCountryCodeFromGeoHeader('US')).toBe('840');
      expect(resolveCountryCodeFromGeoHeader('GB')).toBe('826');
      expect(resolveCountryCodeFromGeoHeader(['FR'])).toBe('250');
    });

    it('returns null for unknown or missing values', () => {
      expect(resolveCountryCodeFromGeoHeader('XX')).toBeNull();
      expect(resolveCountryCodeFromGeoHeader('')).toBeNull();
      expect(resolveCountryCodeFromGeoHeader(undefined)).toBeNull();
    });
  });

  describe('resolveCountryFromRequest', () => {
    it('prefers a valid tc over the geo header', () => {
      expect(resolveCountryFromRequest('BR', '818')).toEqual({
        code: '818',
        source: 'tc',
      });
    });

    it('uses the geo header when tc is absent or not a country', () => {
      expect(resolveCountryFromRequest('BR', undefined)).toEqual({
        code: '076',
        source: 'geo',
      });
      expect(resolveCountryFromRequest('DE', '999')).toEqual({
        code: '276',
        source: 'geo',
      });
    });

    it('returns null when neither resolves', () => {
      expect(resolveCountryFromRequest(undefined, undefined)).toBeNull();
      expect(resolveCountryFromRequest('XX', '999')).toBeNull();
    });
  });

  describe('resolveCountryCodeFromName', () => {
    it('resolves self-reported names, including known aliases', () => {
      expect(resolveCountryCodeFromName('United Kingdom')).toBe('826');
      expect(resolveCountryCodeFromName('France')).toBe('250');
      expect(resolveCountryCodeFromName(' Brazil ')).toBe('076');
      expect(resolveCountryCodeFromName('Brunei')).toBe('096');
    });

    it('returns null for unknown or non-string values', () => {
      expect(resolveCountryCodeFromName('Atlantis')).toBeNull();
      expect(resolveCountryCodeFromName(undefined)).toBeNull();
      expect(resolveCountryCodeFromName(123)).toBeNull();
    });
  });

  it('codeToCountryName handles unpadded codes', () => {
    expect(codeToCountryName('76')).toBe('Brazil');
    expect(codeToCountryName('999')).toBeNull();
  });
});
