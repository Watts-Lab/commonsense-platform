import React, { useEffect, useState } from "react";
// import { RmetShortForm } from "@watts-lab/surveys";

interface SocialSurveyProps {
  statementText: string;
}

import styles from "./style.css";

const SocialSurvey = ({ statementText }: SocialSurveyProps) => {
  const onCompleteCallback = (record: any) => {
    console.log(record);
  };

  return (
    <>
      <p className="text-gray-600">
        Answer questions below about the following statement:
      </p>
      <div className="!sticky !top-0 !z-50 bg-white border-double border-blue-600 border-b-2">
        <h3 className="mt-3.5 text-xl font-medium text-gray-900 dark:text-white text-center py-4">
          {statementText}
        </h3>
      </div>
      <p className="px-3 pt-3 tracking-tighter text-gray-500 md:text-sm dark:text-gray-400">
        Required fields are marked with an asterisk *
      </p>
      <div>
        {/* <RmetShortForm onComplete={onCompleteCallback} /> */}
      </div>
    </>
  );
};

export default SocialSurvey;
