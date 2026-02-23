import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./style.css";
import Consent from "./Consent";

function ConsentGate() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  function handleConsentClick() {
    localStorage.setItem("consent", "true");
    navigate("/statements");
  }

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto py-8 px-4">
      {/* Hero Section */}
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-600 mb-4">
          {t("landing.title")}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
          {t("landing.subtitle")}
        </p>
      </div>

      {/* Consent Document Container */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-sky-400 to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
        <div className="relative overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl">
          <div className="h-[450px] overflow-y-auto p-6 md:p-8 scrollbar-thin scrollbar-thumb-indigo-200 dark:scrollbar-thumb-indigo-900">
            <Consent />
          </div>

          {/* Subtle fade at the bottom to indicate more content */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white dark:from-gray-900 pointer-events-none"></div>
        </div>
      </div>

      {/* Acknowledgement and Action */}
      <div className="mt-8 flex flex-col items-center space-y-6">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
            {t("landing.acknowledgement")}
          </p>
        </div>

        <button
          className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-gradient-to-r from-sky-500 to-indigo-600 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-95"
          onClick={handleConsentClick}
          aria-label={t("landing.button")}
        >
          <span className="relative">{t("landing.button")}</span>
          <svg
            className="w-5 h-5 ml-2 -mr-1 transition-transform group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default ConsentGate;
