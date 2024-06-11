const fs = require('fs');
const path = require('path');

const loadTranslations = (locale) => {
  return cy.fixture(`locales/${locale}/translation.json`);
};

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
