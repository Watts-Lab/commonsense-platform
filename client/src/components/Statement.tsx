import React, { useEffect, useState } from "react";
import ProgressBar from "./ProgressBar";
import SurveyImage from "./SurveyImage";
import "./style.css";
import Question from "./Question";
import { questionData, IQuestionData } from "../data/questions"; // Import here

interface StatementProps {
  statementText: string;
  imageUrl: string;
  data: {
    answers: string[];
  };
  statementId: number;
  currentStep: number;
  totalSteps: number;
  onChange: (statementId: number, answers: string[]) => void;
  unansweredQuestionIndex?: number;
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
  const [answers, setAnswers] = useState<string[]>(data.answers);

  useEffect(() => {
    onChange(statementId, answers);
  }, [answers, onChange]);

  const handleAnswerChange = (id: number, value: string) => {
    setAnswers((prevAnswers) => {
      const newAnswers = [...prevAnswers];
      newAnswers[id - 1] = value;
      data.answers[id - 1] = value;
      return newAnswers;
    });
  };

  return (
    <>
      <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      <SurveyImage imageName={imageUrl} />
      <div className="!sticky !top-0 !z-50 bg-white border-double border-blue-600 border-b-2">
        <h3 className="mt-3.5 text-xl font-medium text-gray-900 dark:text-white text-center py-4">
          {statementText}
        </h3>
      </div>
      <p className="px-3 pt-3 tracking-tighter text-gray-500 md:text-sm dark:text-gray-400">
        Required fields are marked with an asterisk *
      </p>
      {questionData.map((question, index) => {
        const isUnanswered = unansweredQuestionIndex === index + 1;
        return (
          <Question
            key={index}
            statementId={statementId}
            question={question}
            answerValue={answers[index]}
            setAnswer={handleAnswerChange}
            unanswered={isUnanswered}
          />
        );
      })}
    </>
  );
}

export default Statement;
