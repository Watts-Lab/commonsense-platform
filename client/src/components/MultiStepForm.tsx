import { useState, useEffect } from "react";
import Backend from "../apis/backend";
import { useTranslation } from "react-i18next";
import type { StatementData } from "./Layout";
import { useSession } from "../context/SessionContext";
import { questionData } from "../data/questions";

type Props = {
  statementsData: StatementData[];
  handleAnswerSaved: (id: number, saved: boolean) => void;
  updateScore: () => Promise<void>;
  initialStep?: number;
};

function getEnglishTextForAnswer(questionId: number, answerId: number) {
  const question = questionData.find((q) => q.id === questionId);
  if (!question || question.type !== "multipleChoice") return null;
  return question.possibleAnswers[answerId];
}

export default function MultiStepForm({
  statementsData,
  handleAnswerSaved,
  updateScore,
  initialStep = 0,
}: Props) {
  const { i18n } = useTranslation();
  const {
    state: { sessionId },
  } = useSession();

  const [currentStepIndex, setCurrentStepIndex] = useState(initialStep);
  const [loading, setLoading] = useState(false);

  // Sync when initialStep resolves after data fetch
  useEffect(() => {
    if (initialStep > 0) setCurrentStepIndex(initialStep);
  }, [initialStep]);

  async function next() {
    const current = statementsData[currentStepIndex];
    if (!current) return;

    // Require first 5 answers
    if (!current.answers.slice(0, 5).every(Boolean)) return;

    // Already saved → just advance
    if (current.answerSaved) {
      setCurrentStepIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Save to backend
    setLoading(true);
    try {
      await Backend.post("/answers", {
        statementId: current.id,
        I_agree: current.answers[0].split("-")[1] === "1" ? 1 : 0,
        I_agree_reason: getEnglishTextForAnswer(
          2,
          Number(current.answers[1].split("-")[1]),
        ),
        others_agree: current.answers[2].split("-")[1] === "1" ? 1 : 0,
        others_agree_reason: getEnglishTextForAnswer(
          4,
          Number(current.answers[3].split("-")[1]),
        ),
        perceived_commonsense: current.answers[4].split("-")[1] === "1" ? 1 : 0,
        clarity: current.answers[5],
        origLanguage: i18n.language || "en",
        sessionId,
        withCredentials: true,
      });

      handleAnswerSaved(current.id, true);
      await updateScore();
      setCurrentStepIndex((i) => i + 1);
    } catch (error) {
      console.error("Failed to save answer:", error);
    } finally {
      setLoading(false);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    setCurrentStepIndex((i) => Math.max(0, i - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return { currentStepIndex, setCurrentStepIndex, back, next, loading };
}
