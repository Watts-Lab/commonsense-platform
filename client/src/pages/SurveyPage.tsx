import React from "react";

import Layout from "../components/Layout";
import Feedback from "../components/Feedback/Feedback";

const SurveyPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <main className="w-full">
        <Layout />
        <Feedback />
      </main>
    </div>
  );
};

export default SurveyPage;
