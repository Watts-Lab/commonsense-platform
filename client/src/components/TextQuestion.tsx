import React from "react";
import Tooltip from "./Tooltip";
import "./style.css";
import { TextQuestionType } from "../data/questions";

interface QuestionProps {
  statementId: number;
  questionInfo: TextQuestionType;
  answerValue: string;
  setAnswer: (questionId: number, value: string) => void;
}

function TextQuestion({
  statementId,
  questionInfo,
  answerValue,
  setAnswer,
}: QuestionProps) {
  const { id, question, description, tooltip } = questionInfo;
  const questionIdentifier = `${statementId}text${id}`;
  const textareaId = `text-question-${questionIdentifier}`;
  const tooltipId = `tooltip-text-${questionIdentifier}`;

  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswer(id, event.target.value);
  };

  return (
    <div className="py-4">
      <div className="flex flex-row justify-between items-start gap-4 mb-2">
        <label
          htmlFor={textareaId}
          aria-describedby={tooltip ? tooltipId : undefined}
          className="font-bold text-gray-900 dark:text-gray-200 leading-tight required-field cursor-pointer"
          dangerouslySetInnerHTML={{ __html: question }}
        />
        {tooltip && (
          <Tooltip id={tooltipId} className="mt-0.5" text={tooltip} />
        )}
      </div>

      <div className="relative mt-1">
        <textarea
          id={textareaId}
          className="
            w-full p-3 pb-10 rounded-xl border-2 border-gray-200 bg-white
            dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200
            focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100
            dark:focus:border-indigo-500 dark:focus:ring-indigo-900/40
            transition-all duration-150 resize-none text-md leading-relaxed
          "
          placeholder={description}
          value={answerValue}
          onChange={onChange}
          rows={3}
          maxLength={255}
        />
        <div
          className="absolute bottom-3 right-3 p-1 text-xs text-gray-400 dark:text-gray-500 tabular-nums font-semibold"
          aria-hidden="true"
        >
          {answerValue.length}/255
        </div>
      </div>
    </div>
  );
}

export default TextQuestion;
