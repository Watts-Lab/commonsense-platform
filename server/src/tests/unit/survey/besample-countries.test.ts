import {
  BESAMPLE_COUNTRIES,
  BESAMPLE_COUNTRY_CODES,
  isTrackedCountryCode,
  resolveCountryCodeFromTc,
  resolveCountryCodeFromName,
} from '../../../survey/experiments/utils/besample-countries';

describe('besample-countries', () => {
  it('exposes 16 tracked countries with 3-digit codes', () => {
    expect(BESAMPLE_COUNTRIES).toHaveLength(16);
    expect(BESAMPLE_COUNTRY_CODES).toHaveLength(16);
    for (const { code } of BESAMPLE_COUNTRIES) {
      expect(code).toMatch(/^\d{3}$/);
    }
  });

  it('isTrackedCountryCode is true only for the 16 codes', () => {
    expect(isTrackedCountryCode('818')).toBe(true); // Egypt
    expect(isTrackedCountryCode('250')).toBe(false); // France, untracked
  });

  describe('resolveCountryCodeFromTc', () => {
    it('zero-pads a short tc code and resolves it', () => {
      expect(resolveCountryCodeFromTc('76')).toBe('076'); // Brazil
    });

    it('accepts an already-padded code', () => {
      expect(resolveCountryCodeFromTc('818')).toBe('818'); // Egypt
    });

    it('returns null for missing/empty tc', () => {
      expect(resolveCountryCodeFromTc(undefined)).toBeNull();
      expect(resolveCountryCodeFromTc(null)).toBeNull();
      expect(resolveCountryCodeFromTc('')).toBeNull();
    });

    it('returns null for an untracked or unmappable code', () => {
      expect(resolveCountryCodeFromTc('999')).toBeNull(); // Besample placeholder
      expect(resolveCountryCodeFromTc('250')).toBeNull(); // France, untracked
    });
  });

  describe('resolveCountryCodeFromName', () => {
    it('resolves a tracked country name to its code', () => {
      expect(resolveCountryCodeFromName('Brazil')).toBe('076');
      expect(resolveCountryCodeFromName('South Africa')).toBe('710');
    });

    it('returns null for an untracked name', () => {
      expect(resolveCountryCodeFromName('France')).toBeNull();
    });

    it('returns null for a non-string value', () => {
      expect(resolveCountryCodeFromName(undefined)).toBeNull();
      expect(resolveCountryCodeFromName(123 as unknown as string)).toBeNull();
    });
  });
});
