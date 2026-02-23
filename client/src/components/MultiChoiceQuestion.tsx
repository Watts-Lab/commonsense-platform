import React from "react";
import Option from "./Option";
import Tooltip from "./Tooltip";
import "./style.css";
import { MultipleChoiceQuestionType } from "../data/questions";

interface QuestionProps {
  statementId: number;
  questionInfo: MultipleChoiceQuestionType;
  answerValue: string;
  setAnswer: (questionId: number, value: string) => void;
}

function MultiChoiceQuestion({
  statementId,
  questionInfo,
  answerValue,
  setAnswer,
}: QuestionProps) {
  const { id, question, description, possibleAnswers, tooltip, required } =
    questionInfo;
  const questionIdentifier = `${statementId}question${id}`;
  const tooltipId = `tooltip-mc-${questionIdentifier}`;

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAnswer(id, event.target.value);
  };

  return (
    <fieldset className="py-4 border-none">
      <div className="flex flex-row justify-between items-start gap-4 mb-2">
        <legend
          aria-describedby={tooltip ? tooltipId : undefined}
          className="font-bold text-gray-900 dark:text-gray-200 leading-tight required-field"
          dangerouslySetInnerHTML={{ __html: question }}
        />
        {tooltip && (
          <Tooltip id={tooltipId} className="mt-0.5" text={tooltip} />
        )}
      </div>

      {description && (
        <p
          className="text-sm text-gray-500 dark:text-gray-400 mb-3 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: description }}
        ></p>
      )}

      <ul className="grid w-full gap-3 grid-cols-1 md:grid-cols-2">
        {Object.entries(possibleAnswers).map(([key, value]) => {
          const optionIdentifier = `${questionIdentifier}-${key}`;

          return (
            <Option
              key={optionIdentifier}
              text={value}
              id_v={optionIdentifier}
              statementClass={questionIdentifier}
              checked={answerValue === optionIdentifier}
              required={required}
              onChange={onChange}
            />
          );
        })}
      </ul>
    </fieldset>
  );
}

export default MultiChoiceQuestion;
