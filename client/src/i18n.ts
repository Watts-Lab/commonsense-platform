import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend'; // later replace the http-backend with locize-backend
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '../public/locales/en/translation.json';
import es from '../public/locales/es/translation.json';

i18n
  .use(initReactI18next)
  .use(Backend)
  .use(LanguageDetector)
  .init({
    debug: true,
    lng: 'es', // default language
    fallbackLng: 'es', 
    interpolation: {
      escapeValue: false,
    },
    saveMissing: true, // locize
    resources: {
      en: {
        translation: en
      },
      es: {
        translation: es
      }
    }
  });

export default i18n;