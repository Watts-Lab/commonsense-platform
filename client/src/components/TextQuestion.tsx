import React from "react";
import Tooltip from "./Tooltip";
import "./style.css";
// Assuming this is defined in `questions.ts`
import { TextQuestionType } from "../data/questions";

interface QuestionProps {
  statementId: number;
  question: TextQuestionType;
  answerValue: string;
  setAnswer: (questionId: number, value: string) => void;
}

function TextQuestion({ question, answerValue, setAnswer }: QuestionProps) {
  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswer(question.id, event.target.value);
  };

  return (
    <div className="py-3">
      <div className="flex flex-row justify-between">
        <h4
          className="order-1 font-bold required-field dark:text-gray-200"
          dangerouslySetInnerHTML={{ __html: question.question }}
        />
        <Tooltip className="order-last" text={question.tooltip} />
      </div>

      {/* Wrap the textarea and counter in a relative container */}
      <div className="relative mt-2">
        <textarea
          className="w-full p-2 pb-8 border-2 border-gray-300 rounded-md dark:text-gray-200"
          placeholder={question.description}
          value={answerValue}
          onChange={onChange}
          rows={2}
          maxLength={255} // Optional: Enforce max character length
        />
        {/* Character counter */}
        <div className="absolute bottom-2 right-2 p-1 text-xs text-gray-500 dark:text-gray-400">
          {`${answerValue.length}/255`}
        </div>
      </div>
    </div>
  );
}

export default TextQuestion;
