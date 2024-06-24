const fs = require("fs");
const path = require("path");

// load the translations from a given locale
const loadTranslations = (locale) => {
  return cy.fixture(`locales/${locale}/translation.json`);
};

// return any keys from baseTranslations that are not found in targetTranslations
const getMissingKeys = (baseTranslations, targetTranslations) => {
  const missingKeys = [];
  for (const key in baseTranslations) {
    if (!targetTranslations[key]) {
      missingKeys.push(key);
    }
  }
  return missingKeys;
};

module.exports = { loadTranslations, getMissingKeys };
