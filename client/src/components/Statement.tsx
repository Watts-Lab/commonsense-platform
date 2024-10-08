import { useEffect, useState } from "react";
import SurveyImage from "./SurveyImage";
import "./style.css";
import MultiChoiceQuestion from "./MultiChoiceQustion";
import {
  MultipleChoiceQuestionType,
  questionData,
  TextQuestionType,
} from "../data/questions"; // Import here
import TextQuestion from "./TextQuestion";

interface StatementProps {
  statementText: string;
  imageUrl?: string;
  data: {
    answers: string[];
  };
  statementId: number;
  onChange: (statementId: number, answers: string[]) => void;
  unansweredQuestionIndex?: number;
  loading?: boolean;
}

function Statement({
  statementText,
  imageUrl,
  data,
  statementId,
  onChange,
  loading,
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
      <SurveyImage imageName={imageUrl} />
      <div className="!sticky !top-0 !z-10 bg-white border-double border-blue-600 border-b-2 rounded-b-lg dark:bg-gray-600">
        <h3 className="mt-3.5 text-xl font-medium text-gray-900 dark:text-white text-center py-4">
          {statementText}
        </h3>
      </div>
      {loading ? (
        <div className="flex justify-center items-center min-h-[600px]">
          <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {questionData.map((question, index) => {
            if (question.type === "multipleChoice") {
              return (
                <MultiChoiceQuestion
                  key={`${question.type}-${index}`}
                  statementId={statementId}
                  question={question as MultipleChoiceQuestionType}
                  answerValue={answers[index]}
                  setAnswer={handleAnswerChange}
                />
              );
            } else {
              return (
                <TextQuestion
                  key={`${question.type}-${index}`}
                  statementId={statementId}
                  question={question as TextQuestionType}
                  answerValue={answers[index]}
                  setAnswer={handleAnswerChange}
                />
              );
            }
          })}
        </>
      )}
    </>
  );
}

export default Statement;
