import { useEffect, useState } from "react";
import SurveyImage from "./SurveyImage";
import "./style.css";
import MultiChoiceQuestion from "./MultiChoiceQustion";
import { questionData } from "../data/questions"; // Import here
import TextQuestion from "./TextQuestion";
import { useTranslation } from "react-i18next";

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
  const { t, i18n } = useTranslation();

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
        <div className="flex justify-center items-center min-h-[800px]">
          <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {questionData.map((question, index) => {
            const description = i18n.exists(
              `questions.${question.id}.description`
            );
            if (question.type === "multipleChoice") {
              const translatedQuestion = {
                id: question.id,
                question: t(`questions.${question.id}.question`),
                possibleAnswers: t(`questions.${question.id}.possibleAnswers`, {
                  returnObjects: true,
                }) as string[],
                tooltip: t(`questions.${question.id}.tooltip`),
                required: question.required,
                // Only add description if it exists
                ...(description && {
                  description: t(`questions.${question.id}.description`),
                }),
              };
              return (
                <MultiChoiceQuestion
                  key={`${question.type}-${index}`}
                  statementId={statementId}
                  question={translatedQuestion}
                  answerValue={answers[index]}
                  setAnswer={handleAnswerChange}
                />
              );
            } else {
              const translatedQuestion = {
                id: question.id,
                question: t(`questions.${question.id}.question`),
                tooltip: t(`questions.${question.id}.tooltip`),
                required: question.required,
                // Only add description if it exists
                ...(description && {
                  description: t(`questions.${question.id}.description`),
                }),
              };
              return (
                <TextQuestion
                  key={`${question.type}-${index}`}
                  statementId={statementId}
                  question={translatedQuestion}
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
