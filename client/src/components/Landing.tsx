import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import "./style.css";
import Consent from "./Consent";

function Landing(props: any) {
  const { t } = useTranslation();

  return (
    <div className="text-justify leading-relaxed">
      <h2 className="font-bold py-6 text-xl">{t("Common Sense Platform")}</h2>

      <p className="pb-4">
        {t("You are about to complete a survey to measure your common sense. It takes less than 15 minutes for most people.")}
      </p>

      <div className="overflow-y-auto h-44 rounded-md border-2 p-3 px-6">
        <Consent />
      </div>

      <div className="pt-4">
        <div className="text-center text-sm">
          <label
            htmlFor="terms"
            className="font-light text-gray-500 dark:text-gray-300"
          >
            {t("By moving forward you consent to participate in this research project.")}
          </label>
        </div>
      </div>

      <div className="flex flex-col items-center pt-4">
        <Link to="/statements">
          <button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
            {t("Check Your Common Sense")}
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Landing;
