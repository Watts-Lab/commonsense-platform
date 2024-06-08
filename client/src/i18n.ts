import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend'; // later replace the http-backend with locize-backend
import LanguageDetector from 'i18next-browser-languagedetector';

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
    saveMissing: true // locize
  });

export default i18n;