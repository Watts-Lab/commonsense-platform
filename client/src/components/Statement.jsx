import React, { useEffect, useState } from "react";
// import axios from "axios";
import Option from "./Option";
import QuestionOne from "./QuestionOne";
import QuestionTwo from "./QuestionTwo";
import QuestionThree from "./QuestionThree";
import Buttons from "./Buttons";

import "./style.css";
import ProgressBar from "./ProgressBar";

function Statement(props) {
  let text =
    props.statementText.slice(0, 1).toUpperCase() +
    props.statementText.slice(1, props.statementText.length);

  const [questionOneAgree, setQuestionOneAgree] = useState(
    props.data.answers[0]
  );
  const [questionOneOpinion, setQuestionOneOpinion] = useState(
    props.data.answers[1]
  );
  const [questionTwoAgree, setQuestionTwoAgree] = useState(
    props.data.answers[2]
  );
  const [questionTwoOpinion, setQuestionTwoOpinion] = useState(
    props.data.answers[3]
  );
  const [questionThreeAgree, setQuestionThreeAgree] = useState(
    props.data.answers[4]
  );
  const [questionThreeOpinion, setQuestionThreeOpinion] = useState(
    props.data.answers[5]
  );

  useEffect(() => {
    props.onChange(props.statementId, [
      questionOneAgree,
      questionOneOpinion,
      questionTwoAgree,
      questionTwoOpinion,
      questionThreeAgree,
      questionThreeOpinion,
    ]);
    props.data.answers = [
      questionOneAgree,
      questionOneOpinion,
      questionTwoAgree,
      questionTwoOpinion,
      questionThreeAgree,
      questionThreeOpinion,
    ];
    // console.log('props.data %O', props.data.answers);
  }, [
    [
      questionOneAgree,
      questionOneOpinion,
      questionTwoAgree,
      questionTwoOpinion,
      questionThreeAgree,
      questionThreeOpinion,
    ],
  ]);

  return (
    // sticky top-0 z-50
    <>
      <ProgressBar currentStep={props.currentStep} />
      <p className="text-gray-600">
        Answer questions below about the following statement:
      </p>

      <div className=" sticky top-0 z-50 bg-white border-double border-blue-600 border-b-2">
        <h3 className="mt-3.5 text-xl font-medium text-gray-900 dark:text-white text-center py-4">
          {text}
          {console.log(props.data.answereSaved)}
        </h3>
      </div>
      
      <p className="px-3 pt-3 tracking-tighter text-gray-500 md:text-sm dark:text-gray-400">Required fields are marked with an asterisk *</p>
      {/* first set of questions */}
      <QuestionOne
        statementId={props.statementId}
        questionOneAgree={questionOneAgree}
        questionOneOpinion={questionOneOpinion}
        setQuestionOneAgree={setQuestionOneAgree}
        setQuestionOneOpinion={setQuestionOneOpinion}
        unansweredQuestionIndex={props.unansweredQuestionIndex}
      />

      <p className="p-5"> </p>
      {/* second set of questions */}

      <QuestionTwo
        statementId={props.statementId}
        questionTwoAgree={questionTwoAgree}
        questionTwoOpinion={questionTwoOpinion}
        setQuestionTwoAgree={setQuestionTwoAgree}
        setQuestionTwoOpinion={setQuestionTwoOpinion}
      />

      <p className="p-5"> </p>
      {/* third set of questions */}

      <QuestionThree
        statementId={props.statementId}
        questionThreeAgree={questionThreeAgree}
        questionThreeOpinion={questionThreeOpinion}
        setQuestionThreeAgree={setQuestionThreeAgree}
        setQuestionThreeOpinion={setQuestionThreeOpinion}
      />
    </>
  );
}

export default Statement;
