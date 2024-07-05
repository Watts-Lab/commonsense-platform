import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function useLocalizeDocumentAttributes() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (i18n.resolvedLanguage) {
       // set the <html lang> attribute to current language 
      document.documentElement.lang = i18n.resolvedLanguage;

      // set the <html dir> attribute
      document.documentElement.dir = i18n.dir(i18n.resolvedLanguage);
    }

    // localize app title
    document.title = t("app.title");

  }, [i18n, i18n.resolvedLanguage, t]);
}