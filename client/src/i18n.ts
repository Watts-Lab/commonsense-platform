import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

import ar from '../../locales/ar/translation.json';
import bn from '../../locales/bn/translation.json';
import en from '../../locales/en/translation.json';
import es from '../../locales/es/translation.json';
import fr from '../../locales/fr/translation.json';
import hi from '../../locales/hi/translation.json';
import ja from '../../locales/ja/translation.json';
import pt from '../../locales/pt/translation.json';
import ru from '../../locales/ru/translation.json';
import zh from '../../locales/zh/translation.json';

i18n
  //.use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ar: {
        translation: ar,
      },
      bn: {
        translation: bn,
      },
      en: {
        translation: en,
      },
      es: {
        translation: es,
      },
      fr: {
        translation: fr,
      },
      hi: {
        translation: hi,
      },
      ja: {
        translation: ja,
      },
      pt: {
        translation: pt,
      },
      ru: {
        translation: ru,
      },
      zh: {
        translation: zh,
      },
    },
    lng: 'en', // default language
    fallbackLng: 'en', 
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;