import React from "react";

import Layout from "../components/Layout";
import Feedback from "../components/Feedback/Feedback";
import DarkModeSwitcher from "../components/DarkModeSwitch";

const SurveyPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="mx-auto p-3 max-w-3xl pb-14">
        <Layout />
        <Feedback />
        <DarkModeSwitcher />
      </main>
    </div>
  );
};

export default SurveyPage;
