import "survey-core/defaultV2.min.css";
import { Survey } from "survey-react-ui";
import { Model } from "survey-core";

import surveyJson from "../data/demographics.json";

const Demo: React.FC = () => {
  const survey = new Model(surveyJson);

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <main className="flex-grow bg-gray-100 w-[50%] max-w-[1000px] mx-auto">
        <Survey model={survey} />
      </main>
    </div>
  );
};

export default Demo;
