const { loadTranslations, getMissingKeys } = require("../support/utils");

describe("i18n Coverage Test", () => {
  const locales = ["en", "es", "fr", "pt", "zh", "ar", "ru", "ja", "bn", "hi"];
  const baseLocale = "en";

  before(() => {
    cy.fixture(`locales/${baseLocale}/translation.json`).as("baseTranslations");
  });

  // verify that all keys in each locale have been translated
  locales.forEach((locale) => {
    if (locale !== baseLocale) {
      it(`should have all keys translated for ${locale}`, function () {
        loadTranslations(locale).then((targetTranslations) => {
          const missingKeys = getMissingKeys(
            this.baseTranslations,
            targetTranslations
          );
          expect(missingKeys.length).to.equal(
            0,
            `Missing keys: ${missingKeys.join(", ")}`
          );
        });
      });
    }
  });
});
