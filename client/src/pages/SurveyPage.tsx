import React from "react";

import Layout from "../components/Layout";
import Header from "../partials/Header";
import Feedback from "../components/Feedback/Feedback";

const SurveyPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="mx-auto p-3 max-w-3xl pb-14">
        <Layout />
        <Feedback />
      </main>
    </div>
  );
};

export default SurveyPage;
