import SurveyImage from "./SurveyImage";
import "./style.css";
import MultiChoiceQuestion from "./MultiChoiceQuestion";
import { questionData } from "../data/questions";
import TextQuestion from "./TextQuestion";
import { useTranslation } from "react-i18next";

interface StatementProps {
  statementText: string;
  imageUrl?: string;
  data: { answers: string[] };
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
  const { t, i18n } = useTranslation();

  const handleAnswerChange = (id: number, value: string) => {
    const newAnswers = [...data.answers];
    newAnswers[id - 1] = value;
    onChange(statementId, newAnswers);
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto">
      <SurveyImage imageName={imageUrl} />

      {/* Sticky statement header */}
      <div className="!sticky !top-0 !z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b-2 border-indigo-400 rounded-b-2xl shadow-sm mb-4">
        <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white text-center py-5 px-6 leading-snug tracking-tight">
          {statementText}
        </h3>
      </div>

      <div className="px-4 pb-8 space-y-2">
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-indigo-400 border-dashed rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {questionData.map((question, index) => {
              const hasDesc = i18n.exists(
                `questions.${question.id}.description`,
              );

              if (question.type === "multipleChoice") {
                const translatedQuestion = {
                  id: question.id,
                  type: "multipleChoice" as const,
                  question: t(`questions.${question.id}.question`),
                  possibleAnswers: t(
                    `questions.${question.id}.possibleAnswers`,
                    {
                      returnObjects: true,
                    },
                  ) as { [key: number]: string },
                  tooltip: t(`questions.${question.id}.tooltip`),
                  required: question.required,
                  ...(hasDesc && {
                    description: t(`questions.${question.id}.description`),
                  }),
                };
                return (
                  <MultiChoiceQuestion
                    key={`${statementId}-${question.id}`}
                    statementId={statementId}
                    questionInfo={translatedQuestion}
                    answerValue={data.answers[index]}
                    setAnswer={handleAnswerChange}
                  />
                );
              } else {
                const translatedQuestion = {
                  id: question.id,
                  type: "text" as const,
                  question: t(`questions.${question.id}.question`),
                  tooltip: t(`questions.${question.id}.tooltip`),
                  required: question.required,
                  ...(hasDesc && {
                    description: t(`questions.${question.id}.description`),
                  }),
                };
                return (
                  <TextQuestion
                    key={`${statementId}-${question.id}`}
                    statementId={statementId}
                    questionInfo={translatedQuestion}
                    answerValue={data.answers[index]}
                    setAnswer={handleAnswerChange}
                  />
                );
              }
            })}
          </>
        )}
      </div>
    </div>
  );
}

export default Statement;
