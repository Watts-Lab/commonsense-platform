import React from "react";
import Option from "./Option";
import Tooltip from "./Tooltip";

import "./style.css";

// Assuming this is defined in `questions.ts`
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

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAnswer(id, event.target.value);
  };

  return (
    <div className="py-3" onChange={onChange}>
      <div className="flex flex-row justify-between">
        <h4
          className="order-1 font-bold required-field dark:text-gray-200"
          dangerouslySetInnerHTML={{ __html: question }}
        />
        <Tooltip className="order-last" text={tooltip} />
      </div>

      {description && (
        <p
          className="text-gray-600 dark:text-gray-200"
          dangerouslySetInnerHTML={{ __html: description }}
        ></p>
      )}

      <ul className="grid w-full gap-2 md:grid-cols-2 py-2">
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
    </div>
  );
}

export default MultiChoiceQuestion;
