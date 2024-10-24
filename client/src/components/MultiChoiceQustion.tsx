import React from "react";
import Option from "./Option";
import Tooltip from "./Tooltip";

import "./style.css";

// Assuming this is defined in `questions.ts`
import { MultipleChoiceQuestionType } from "../data/questions";

interface QuestionProps {
  statementId: number;
  question: MultipleChoiceQuestionType;
  answerValue: string;
  setAnswer: (questionId: number, value: string) => void;
}

function MultiChoiceQuestion({
  statementId,
  question,
  answerValue,
  setAnswer,
}: QuestionProps) {
  const questionIdentifier = `${statementId}question${question.id}`;

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAnswer(question.id, event.target.value);
  };

  return (
    <div className="py-3" onChange={onChange}>
      <div className="flex flex-row justify-between">
        <h4
          className="order-1 font-bold required-field dark:text-gray-200"
          dangerouslySetInnerHTML={{ __html: question.question }}
        />
        <Tooltip className="order-last" text={question.tooltip} />
      </div>

      {question.description && (
        <p
          className="text-gray-600 dark:text-gray-200"
          dangerouslySetInnerHTML={{ __html: question.description }}
        ></p>
      )}

      <ul className="grid w-full gap-2 md:grid-cols-2 py-2">
        {question.possibleAnswers.map((optionText) => {
          const optionIdentifier = `${questionIdentifier}-${optionText}`;

          return (
            <Option
              key={optionIdentifier}
              text={optionText}
              id_v={optionIdentifier}
              statementClass={questionIdentifier}
              checked={answerValue === optionIdentifier}
              required={question.required}
              onChange={onChange}
            />
          );
        })}
      </ul>
    </div>
  );
}

export default MultiChoiceQuestion;
