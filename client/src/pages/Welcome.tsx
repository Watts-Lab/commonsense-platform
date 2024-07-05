import React from "react";
import { useTranslation } from "react-i18next";
import Header from "../partials/Header";

const Welcome: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/*  Site header */}
      <Header where="/" />

      {/*  Page content */}
      <main className="flex-grow">
        <section className="bg-gradient-to-b from-gray-100 to-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="pt-32 pb-12 md:pt-40 md:pb-20">
              {/* Page header */}
              <div className="max-w-3xl mx-auto text-center pb-12 md:pb-20">
                <p className="h4">
                  {/* Welcome to the Common Sense Platform */}
                  {t("welcome.title")}
                </p>
                <p>
                  {/* You can click on the link sent to verify your email address. */}
                  {t("welcome.subtitle")}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Welcome;
