import React, { useEffect, useState } from "react";
import Backend from "../apis/backend";
import useStickyState from "../hooks/useStickyState";

import "./style.css";

function MultiStepForm(props) {
  // const [currentStepIndex, setCurrentStepIndex] = useStickyState(
  //   0,
  //   "currentStepIndex"
  // );

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  function checkAnswers(answerList) {
    if (answerList.includes("")) {
      return false;
    } else {
      return true;
    }
  }

  function whichQuestion(answerList) {
    if (answerList.includes("")) {
      return answerList.indexOf("");
    } else {
      return null;
    }
  }

  function next() {
    if (checkAnswers(props.steps[currentStepIndex].answers.slice(0, 5))) {
      setCurrentStepIndex((i) => {
        if (i > props.steps.length - 1) return i;
        return i + 1;
      });

      if (currentStepIndex === props.steps.length - 1) {
        props.pushResultComponent();
      }

      // if user finishes a statement, then get new statement (stays 2 steps ahead)
      if (
        currentStepIndex > props.steps.length - 3 &&
        currentStepIndex < props.steps.length - 1
      ) {
        props.getNextStatement(props.sessionId).then((ret_val) => {
          props.pushNewStatement(ret_val.value.id, ret_val.value.statement);
        });
      }

      // if the user answered the statement, then save the answer and set the answerSaved flag to true
      if (!props.steps[currentStepIndex].answereSaved) {
        Backend.post("/answers", {
          statementId: props.steps[currentStepIndex].id,
          I_agree:
            props.steps[currentStepIndex].answers[0].split("-")[1] === "Yes"
              ? 1
              : 0,
          I_agree_reason:
            props.steps[currentStepIndex].answers[1].split("-")[1],
          others_agree:
            props.steps[currentStepIndex].answers[2].split("-")[1] === "Yes"
              ? 1
              : 0,
          others_agree_reason:
            props.steps[currentStepIndex].answers[3].split("-")[1],
          perceived_commonsense:
            props.steps[currentStepIndex].answers[4].split("-")[1] === "Yes"
              ? 1
              : 0,
          clarity: props.steps[currentStepIndex].answers[5].split("-")[1],
          origLanguage: "en",
          sessionId: props.sessionId,
          withCredentials: true,
        }).then((response) => {
          props.handleAnswerSaving(props.steps[currentStepIndex].id, true);
          props.steps[currentStepIndex].answereSaved = true;
        });
      }
    } else {
      // TODO: invoke error on the button
      props.setUnansweredQuestionIndex(
        whichQuestion(props.steps[currentStepIndex].answers.slice(0, 5))
      );
      return whichQuestion(props.steps[currentStepIndex].answers.slice(0, 5));
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function back() {
    setCurrentStepIndex((i) => {
      if (i <= 0) return i;
      return i - 1;
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function goTo(index) {
    setCurrentStepIndex(index);
  }

  return {
    currentStepIndex,
    setCurrentStepIndex,
    step: props.steps[currentStepIndex],
    goTo,
    next,
    back,
    steps: props.steps,
  };
}

export default MultiStepForm;
