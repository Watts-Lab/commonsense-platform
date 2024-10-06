import { useState } from "react";
import Backend from "../apis/backend";

import "./style.css";
import { statementStorageData } from "./Layout";
import { useSession } from "../context/SessionContext";

type MultiStepFormProps = {
  steps: statementStorageData[];
  handleAnswerSaving: (tid: number, answerState: boolean) => void;
  getNextStatement: (sessionId: string) => void;
  pushNewStatement: (id: number, statement: string) => void;
};

function MultiStepForm({ steps, handleAnswerSaving }: MultiStepFormProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const {
    state: { sessionId },
  } = useSession();

  function checkAnswers(answerList: string[]) {
    if (answerList.includes("")) {
      return false;
    } else {
      return true;
    }
  }

  function next() {
    if (checkAnswers(steps[currentStepIndex].answers.slice(0, 5))) {
      setCurrentStepIndex((i) => {
        if (i > steps.length - 1) return i;
        return i + 1;
      });

      // if the user answered the statement, then save the answer and set the answerSaved flag to true
      if (!steps[currentStepIndex].answereSaved) {
        Backend.post("/answers", {
          statementId: steps[currentStepIndex].id,
          I_agree:
            steps[currentStepIndex].answers[0].split("-")[1] === "Yes" ? 1 : 0,
          I_agree_reason: steps[currentStepIndex].answers[1].split("-")[1],
          others_agree:
            steps[currentStepIndex].answers[2].split("-")[1] === "Yes" ? 1 : 0,
          others_agree_reason: steps[currentStepIndex].answers[3].split("-")[1],
          perceived_commonsense:
            steps[currentStepIndex].answers[4].split("-")[1] === "Yes" ? 1 : 0,
          clarity: "removed",
          origLanguage: "en",
          sessionId: sessionId,
          withCredentials: true,
        }).then(() => {
          handleAnswerSaving(steps[currentStepIndex].id, true);
          steps[currentStepIndex].answereSaved = true;
        });
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

  return {
    currentStepIndex,
    setCurrentStepIndex,
    step: steps[currentStepIndex],
    next,
    back,
    steps: steps,
  };
}

export default MultiStepForm;
