import { useEffect } from "react";
import { useTranslation } from "react-i18next";

// a custom hook that sets the direction of the text depending on the active locale
export default function useLocalizeDocumentAttributes() {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (i18n.resolvedLanguage) {
   
      // set the <html lang> attribute to current language 
      document.documentElement.lang = i18n.resolvedLanguage;

      // set the <html dir> attribute
      document.documentElement.dir = i18n.dir(i18n.resolvedLanguage);
    }
  }, [i18n, i18n.resolvedLanguage]);
}