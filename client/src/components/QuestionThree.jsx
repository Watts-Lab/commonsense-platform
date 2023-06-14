import React, { useEffect, useState } from "react";
import Option from "./Option";
import Tooltip from "./Tooltip";

import "./style.css";

function QuestionThree(props) {
  const questionIdentifier = props.statementId + "question3";

  function onChangeAgreement(event) {
    props.setQuestionThreeAgree(event.target.value);
  }

  function onChangeOpinion(event) {
    props.setQuestionThreeOpinion(event.target.value);
  }

  const clarity_reasons = [
    "Clear: it is clearly written and I can understand the meaning",
    "Confusing: I don't quite understand what it means, but it seems like it is written correctly",
    "Gibberish: I don't know what it means, it is gibberish or poorly written so it doesn't make sense",
  ];

  return (
    <>
      <div className="p-3" onChange={onChangeAgreement}>
        <div className="flex flex-row justify-between">
          <h4 className="font-bold">
            Overall, do you think this statement is an example of common sense?
            *
          </h4>
          <Tooltip
            className="order-last"
            text="This question aims to gauge your perception of the given statement as an example of common sense. We are interested in understanding your overall evaluation and whether you believe the statement aligns with widely accepted general knowledge or intuitive understanding."
          />
        </div>

        <ul className="grid w-full gap-2 md:grid-cols-1 py-2">
          <Option
            text="Yes, it is common sense"
            id_v={questionIdentifier + "ag1"}
            statementClass={questionIdentifier + "agree"}
            checked={props.questionThreeAgree === questionIdentifier + "ag1"}
            required={true}
          />
          <Option
            text="No, it is not common sense"
            id_v={questionIdentifier + "ag0"}
            statementClass={questionIdentifier + "agree"}
            checked={props.questionThreeAgree === questionIdentifier + "ag0"}
            required={true}
          />
        </ul>
      </div>

      <div className="p-3" onChange={onChangeOpinion}>
        <div className="flex flex-row justify-between">
          <h4>
            <b>Optional:</b> How do you think most people would categorize this
            statement
          </h4>
          <Tooltip
            className="order-last"
            text="This question aims to gather insights on how you believe most people would categorize the given statement in terms of common sense. We are interested in understanding your perception of how the majority of individuals would classify or label the statement in relation to its alignment with widely accepted general knowledge or intuitive understanding."
          />
        </div>

        <ul className="grid w-full gap-2 md:grid-cols-1 py-2">
          {clarity_reasons.map((reason, index) => (
            <Option
              key={index}
              text={reason}
              id_v={questionIdentifier + '-' + reason}
              statementClass={questionIdentifier + "opinion"}
              checked={props.questionThreeOpinion === questionIdentifier + '-' + reason}
              required={false}
            />
          ))}
        </ul>
      </div>
    </>
  );
}

export default QuestionThree;
