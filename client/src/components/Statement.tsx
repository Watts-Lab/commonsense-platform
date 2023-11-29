import React, { useEffect, useState } from "react";
import QuestionOne from "./QuestionOne";
import QuestionTwo from "./QuestionTwo";
import QuestionThree from "./QuestionThree";
import SurveyImage from "./SurveyImage";
import "./style.css";
import ProgressBar from "./ProgressBar";

interface StatementProps {
  statementText: string;
  imageUrl: string;
  data: {
    answers: boolean[];
  };
  statementId: number;
  currentStep: number;
  totalSteps: number;
  onChange: (statementId: number, answers: boolean[]) => void;
  unansweredQuestionIndex?: number; // Assuming it's optional since it's not used in the original code
}

function Statement({
  statementText,
  imageUrl,
  data,
  statementId,
  currentStep,
  totalSteps,
  onChange,
  unansweredQuestionIndex,
}: StatementProps) {
  const [questionOneAgree, setQuestionOneAgree] = useState<boolean>(
    data.answers[0]
  );
  const [questionOneOpinion, setQuestionOneOpinion] = useState<boolean>(
    data.answers[1]
  );
  const [questionTwoAgree, setQuestionTwoAgree] = useState<boolean>(
    data.answers[2]
  );
  const [questionTwoOpinion, setQuestionTwoOpinion] = useState<boolean>(
    data.answers[3]
  );
  const [questionThreeAgree, setQuestionThreeAgree] = useState<boolean>(
    data.answers[4]
  );
  const [questionThreeOpinion, setQuestionThreeOpinion] = useState<boolean>(
    data.answers[5]
  );

  useEffect(() => {
    onChange(statementId, [
      questionOneAgree,
      questionOneOpinion,
      questionTwoAgree,
      questionTwoOpinion,
      questionThreeAgree,
      questionThreeOpinion,
    ]);
    // Be careful with writing to props like this as props in React are meant to be immutable
    // This line can have unexpected side effects.
    data.answers = [
      questionOneAgree,
      questionOneOpinion,
      questionTwoAgree,
      questionTwoOpinion,
      questionThreeAgree,
      questionThreeOpinion,
    ];
    // console.log('props.data %O', data.answers);
  }, [
    questionOneAgree,
    questionOneOpinion,
    questionTwoAgree,
    questionTwoOpinion,
    questionThreeAgree,
    questionThreeOpinion,
  ]);

  return (
    <>
      <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      <SurveyImage imageName={imageUrl} />
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
      <QuestionOne
        statementId={statementId}
        questionOneAgree={questionOneAgree}
        questionOneOpinion={questionOneOpinion}
        setQuestionOneAgree={setQuestionOneAgree}
        setQuestionOneOpinion={setQuestionOneOpinion}
        unansweredQuestionIndex={unansweredQuestionIndex}
      />
      <p className="p-5"></p>
      <QuestionTwo
        statementId={statementId}
        questionTwoAgree={questionTwoAgree}
        questionTwoOpinion={questionTwoOpinion}
        setQuestionTwoAgree={setQuestionTwoAgree}
        setQuestionTwoOpinion={setQuestionTwoOpinion}
      />
      <p className="p-5"></p>
      <QuestionThree
        statementId={statementId}
        questionThreeAgree={questionThreeAgree}
        questionThreeOpinion={questionThreeOpinion}
        setQuestionThreeAgree={setQuestionThreeAgree}
        setQuestionThreeOpinion={setQuestionThreeOpinion}
      />
    </>
  );
}

export default Statement;
