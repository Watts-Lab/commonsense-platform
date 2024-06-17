import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
//import Backend from 'i18next-locize-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

export const supportedLngs = {
  en: "English",
  es: "Spanish (Español)",
  ar: "Arabic (العربية)",
  bn: "Bengali (বাংলা)",
  zh: "Chinese (中国人)",
  fr: "French (Français)",
  hi: "Hindi (हिंदी)",
  ja: "Japanese (日本語)",
  pt: "Portuguese (Português)",
  ru: "Russian (Русский)"
}

const locizeOptions = {
  projectId: import.meta.env.VITE_LOCIZE_PROJECT_ID,
  apiKey: import.meta.env.VITE_LOCIZE_API_KEY
}

i18n 
  .use(initReactI18next) // pass the instance to react-i18next to make it available to all the components
  .use(Backend) // load the translations using backend plugin
  .use(LanguageDetector) // detect the preferred language of the user 
  .init({ // config options
    supportedLngs: Object.keys(supportedLngs), // import supported locales
    debug: true, // enable outputs in dev console
    fallbackLng: 'en', // fallback language when a translation is missing in the locale
    interpolation: {
      escapeValue: false, 
    }
    // backend: locizeOptions,
    // saveMissing: true // only use this in development and not in production
  });

export default i18n;