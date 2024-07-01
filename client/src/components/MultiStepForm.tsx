import React, { useEffect, useState } from "react";
import Backend from "../apis/backend";
import useStickyState from "../hooks/useStickyState";
import { IQuestionData, questionData } from '../data/questions';
import "./style.css";

function MultiStepForm(props) {
  // const [currentStepIndex, setCurrentStepIndex] = useStickyState(
  //   0,
  //   "currentStepIndex"
  // );

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [questions, setQuestions] = useState<IQuestionData[]>([]);

  useEffect(() => {
    setQuestions(questionData);
  }, []);

  function checkAnswers(answerList: string[]) {
    if (answerList.includes("")) {
      return false;
    } else {
      return true;
    }
  }

  function whichQuestion(answerList: string[]) {
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
        const answers = props.steps[currentStepIndex].answers;
        const currentQuestion = questions.find(q => q.id === props.steps[currentStepIndex].id);

        if (currentQuestion) {
          const payload: Record<string, any> = {
            statementId: props.steps[currentStepIndex].id,
            sessionId: props.sessionId,
            origLanguage: "en",
            clientVersion: process.env.GITHUB_HASH || 'default_version', // Ensure this is set in your environment
          };

          // Construct payload dynamically based on possible answers
          currentQuestion.possibleAnswers.forEach((_, index) => {
            const [id, value] = answers[index].split("-");
            if (index === 0) payload["I_agree"] = value === "Yes" ? 1 : 0;
            if (index === 1) payload["I_agree_reason"] = value;
            if (index === 2) payload["others_agree"] = value === "Yes" ? 1 : 0;
            if (index === 3) payload["others_agree_reason"] = value;
            if (index === 4) payload["perceived_commonsense"] = value === "Yes" ? 1 : 0;
            if (index === 5 && value !== "") payload["clarity"] = value;
          });

          Backend.post("/answers", payload).then((response) => {
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
