import React, { useEffect, useState } from "react";
import Option from "./Option";
import Tooltip from "./Tooltip";

import "./style.css";

const questionsConfig: Array<{
  id: number;
  questionText: string;
  questionDescription?: string;
  tooltipText: string;
  options: string[];
  answerStateKey: "questionOneAgree" | "questionOneOpinion";
  answerFunctionKey: "setQuestionOneAgree" | "setQuestionOneOpinion";
}> = [
  {
    id: 1,
    questionText: "Do you agree with this statement? *",
    tooltipText: "How much do you think this is considered common sense",
    questionDescription:
      "(if the answer is, it depends, respond with your most common or most likely answer)",
    options: ["Yes", "No"],
    answerStateKey: "questionOneAgree",
    answerFunctionKey: "setQuestionOneAgree",
  },
  {
    id: 2,
    questionText: "Why did you answer the way you did about yourself? *",
    tooltipText:
      "By inquiring about why you chose the specific answer, we aim to understand the factors that influenced your decision. Please provide an explanation or rationale for your response.",
    options: [
      "It's obvious",
      "It's something I learned",
      "It's my opinion",
      "I don't know",
    ],
    answerStateKey: "questionOneOpinion",
    answerFunctionKey: "setQuestionOneOpinion",
  },
];

function QuestionOne(props) {
  const questionIdentifier = props.statementId + "question1";

  // Handlers can be generalized based on the state key you want to update
  function handleAnswerChange(stateKey, value) {
    props[stateKey](value);
  }

  const errorStyle = "p-3 rounded-md border-2 border-rose-600";

  return (
    <>
      {questionsConfig.map((question, index) => {
        const questionIdentifier = `${props.statementId}question${question.id}`; // Unique for each question

        return (
          <div
            key={question.id}
            className={props.unansweredQuestionIndex === index ? errorStyle : "p-3"}
            onChange={(event) =>
              handleAnswerChange(question.answerFunctionKey, event.target.value)
            }
          >
            <div className="flex flex-row justify-between">
              <h4 className="order-1 font-bold required-field">
                {question.questionText}
              </h4>
              <Tooltip className="order-last" text={question.tooltipText} />
            </div>

            {question.questionDescription && (
              <p className="text-gray-600">{question.questionDescription}</p>
            )}

            <ul className="grid w-full gap-2 md:grid-cols-2 py-2">
              {question.options.map((optionText) => {
                const optionIdentifier = `${questionIdentifier}-${optionText}`; // Unique for each option

                return (
                  <Option
                    key={optionIdentifier}
                    text={optionText}
                    id_v={optionIdentifier}
                    statementClass={`${questionIdentifier}reason-${optionText}`} // Dynamic statementClass based on the question and option
                    checked={
                      props[question.answerStateKey] === optionIdentifier
                    }
                    required={true}
                  />
                );
              })}
            </ul>
          </div>
        );
      })}
    </>
  );
}

export default QuestionOne;

