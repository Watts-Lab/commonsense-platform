import React, { useEffect, useState } from "react";
import ProgressBar from "../ProgressBar";
import SurveyImage from "../SurveyImage";
import "../style.css";
import Question from "../Question";
import { demoQuestionData } from "../../data/questions"; // Import here

interface StatementProps {
  statementText: string;
  imageUrl?: string;
  data: {
    answers: string[];
  };
  statementId: number;
  currentStep: number;
  totalSteps: number;
  onChange: (statementId: number, answers: string[]) => void;
  unansweredQuestionIndex?: number;
}

const DemoStatement = ({
  statementText,
  imageUrl,
  data,
  statementId,
  currentStep,
  totalSteps,
  onChange,
  unansweredQuestionIndex,
}: StatementProps) => {
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
      <div className="!sticky !top-0 !z-10 bg-white  dark:bg-slate-400">
        <h3 className="mt-3.5 text-xl font-medium text-gray-900 dark:text-white text-center py-4 bg-gray-300 dark:font-light dark:bg-slate-400 px-3">
          {statementText}
        </h3>
      </div>
      {demoQuestionData.map((question, index) => {
        const isUnanswered = unansweredQuestionIndex === index + 1;
        return (
          <Question
            key={index}
            statementId={statementId}
            question={question}
            answerValue={answers[question.id - 1]}
            setAnswer={handleAnswerChange}
            unanswered={isUnanswered}
          />
        );
      })}
    </>
  );
};

export default DemoStatement;