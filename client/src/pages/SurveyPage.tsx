import React from "react";

import Layout from "../components/Layout";
import Feedback from "../components/Feedback/Feedback";
import DarkModeSwitcher from "../components/DarkModeSwitch";

const SurveyPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <main className="p-3 max-w-3xl w-full pb-14">
        <Layout />
        <Feedback />
        <DarkModeSwitcher />
      </main>
    </div>
  );
};

export default SurveyPage;
