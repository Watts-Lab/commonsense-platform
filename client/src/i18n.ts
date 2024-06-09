import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend'; // later replace the http-backend with locize-backend
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(initReactI18next)
  .use(Backend) // loads the translations from backend plugin
  .use(LanguageDetector) // detects the preferred language of the user
  .init({
    debug: true,
    fallbackLng: 'en', 
    interpolation: {
      escapeValue: false,
    }
  });

export default i18n;