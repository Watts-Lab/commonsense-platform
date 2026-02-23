import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
// @ts-expect-error no types available
import { CRT, RmeTen, DemographicsLongInternational } from "@watts-lab/surveys";
import Statement from "./Statement";
import MultiStepForm from "./MultiStepForm";
import Result from "./Result";
import { questionData } from "../data/questions";
import useStickyState from "../hooks/useStickyState";
import Backend from "../apis/backend";
import ProgressBar from "./ProgressBar";
import { useSession } from "../context/SessionContext";
import ScoreDisplay from "./ScoreDisplay";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { toast } from "sonner";

import "./style.css";
// ─── Types ───────────────────────────────────────────────

export type StatementData = {
  id: number;
  answers: string[];
  answerSaved: boolean;
};

type StatementStep = {
  type: "statement";
  id: number;
  text: string;
  image?: string;
};

type SurveyStep = {
  type: "crt" | "rmet" | "demographics";
};

type ResultStep = {
  type: "result";
  experimentId: number;
};

type Step = StatementStep | SurveyStep | ResultStep;

// Surveys to append after statements — skip if already completed
const SURVEY_CONFIGS = [
  { type: "crt" as const, localStorageKey: "CRT" },
  { type: "rmet" as const, localStorageKey: "rmeTen" },
  {
    type: "demographics" as const,
    localStorageKey: "demographicsLongInternational",
  },
];

// ─── Component ───────────────────────────────────────────

export default function Layout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const {
    state: { sessionId, urlParams },
    actions: { captureUrlParams },
  } = useSession();

  // ─── State ─────────────────────────────────────────────

  const [loading, setLoading] = useState(true);
  const [isAuxSaving, setIsAuxSaving] = useState(false);
  const [initialStepIndex, setInitialStepIndex] = useState(0);

  // Data-driven step list (not ReactNode[])
  const [steps, setSteps] = useState<Step[]>([]);

  // Answer data for statement steps only
  const [statementsData, setStatementsData] = useStickyState<StatementData[]>(
    [],
    "statementsData",
  );

  const [currentScore, setCurrentScore] = useState({
    commonsense: 0,
    awareness: 0,
    consensus: 0,
  });

  // ─── Derived values ────────────────────────────────────

  const statementCount = useMemo(
    () => steps.filter((s) => s.type === "statement").length,
    [steps],
  );

  // ─── Handlers ──────────────────────────────────────────

  const handleStatementChange = (id: number, updatedAnswers: string[]) => {
    setStatementsData((prev) =>
      prev.map((d) => (d.id === id ? { ...d, answers: updatedAnswers } : d)),
    );
  };

  const handleAnswerSaved = (id: number, saved: boolean) => {
    setStatementsData((prev) =>
      prev.map((d) => (d.id === id ? { ...d, answerSaved: saved } : d)),
    );
  };

  const updateScore = async () => {
    try {
      const { data } = await Backend.post("/results", { sessionId });
      if (data.commonsensicality !== 0) {
        setCurrentScore({
          commonsense: Math.round(data.commonsensicality * 100),
          awareness: Math.round(data.awareness * 100),
          consensus: Math.round(data.consensus * 100),
        });
      }
    } catch (error) {
      console.error("Error fetching score:", error);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSurveyComplete = async (record: any) => {
    setIsAuxSaving(true);
    try {
      await Backend.post("/experiments/individual", {
        sessionId,
        informationType: record.surveyName,
        experimentInfo: record,
      });
      setCurrentStepIndex((i: number) => i + 1);
      if (record.surveyName !== "demographics") {
        localStorage.setItem(record.surveyName, JSON.stringify(record));
      }
    } catch (error) {
      console.error("Failed to save survey:", error);
      toast.error(
        "Failed to save. Please check your connection and try again.",
      );
      // alert("Failed to save. Please check your connection and try again.");
    } finally {
      setIsAuxSaving(false);
    }
  };

  // ─── Multi-step navigation ─────────────────────────────

  const {
    currentStepIndex,
    setCurrentStepIndex,
    back,
    next,
    loading: isSaving,
  } = MultiStepForm({
    statementsData,
    handleAnswerSaved,
    updateScore,
    initialStep: initialStepIndex,
  });

  const currentStep = steps[currentStepIndex];
  const isStatementStep = currentStep?.type === "statement";
  const isLastStatement = currentStepIndex === statementCount - 1;

  // ─── Data fetching ─────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Capture URL params
      const newParams: { key: string; value: string }[] = [];
      searchParams.forEach((value, key) => newParams.push({ key, value }));
      if (newParams.length > 0) captureUrlParams(newParams);

      // Require consent
      if (localStorage.getItem("consent") !== "true") {
        navigate("/survey", { replace: true });
        return;
      }

      try {
        setLoading(true);

        const allParams = [...urlParams, ...newParams];
        const paramObj = allParams.reduce<Record<string, string>>(
          (acc, { key, value }) => ({ ...acc, [key]: value }),
          {},
        );

        const { data } = await Backend.get("/experiments", {
          params: { sessionId, ...paramObj, language },
        });

        if (cancelled) return;

        const { statements, experimentId } = data;

        // ── Merge statement data with saved answers ──

        const freshData: StatementData[] = statements.map(
          (s: { id: number; answereSaved?: boolean }) => ({
            id: s.id,
            answers: new Array(questionData.length).fill(""),
            answerSaved: s.answereSaved || false,
          }),
        );

        const mergedData = freshData.map((fresh) => {
          const saved = statementsData.find((s) => s.id === fresh.id);
          return saved
            ? { ...saved, answerSaved: saved.answerSaved || fresh.answerSaved }
            : fresh;
        });

        setStatementsData(mergedData);

        // ── Build step list ──

        const statementSteps: StatementStep[] = statements.map(
          (s: { id: number; statement: string; image?: string }) => ({
            type: "statement" as const,
            id: s.id,
            text: s.statement,
            image: s.image,
          }),
        );

        // Only include surveys that haven't been completed
        const surveySteps: SurveyStep[] = SURVEY_CONFIGS.filter(
          ({ localStorageKey }) => !localStorage.getItem(localStorageKey),
        ).map(({ type }) => ({ type }));

        const resultStep: ResultStep = { type: "result", experimentId };

        setSteps([...statementSteps, ...surveySteps, resultStep]);

        // ── Find starting step (first unanswered statement) ──

        const firstUnanswered = mergedData.findIndex((d) => !d.answerSaved);
        setInitialStepIndex(
          firstUnanswered === -1 ? mergedData.length : firstUnanswered,
        );
      } catch (error) {
        console.error("Failed to load experiment:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [language, sessionId, searchParams.toString()]);

  // ─── Render current step by type ───────────────────────

  const renderStep = () => {
    if (!currentStep) return null;

    switch (currentStep.type) {
      case "statement": {
        const data = statementsData.find((d) => d.id === currentStep.id) ?? {
          id: currentStep.id,
          answers: new Array(questionData.length).fill(""),
          answerSaved: false,
        };
        return (
          <Statement
            statementText={currentStep.text}
            imageUrl={currentStep.image}
            statementId={currentStep.id}
            onChange={handleStatementChange}
            data={data}
          />
        );
      }
      case "crt":
        return (
          <CRT
            storageName="crt"
            onComplete={onSurveyComplete}
            language={language}
          />
        );
      case "rmet":
        return (
          <RmeTen
            storageName="rmeten"
            onComplete={onSurveyComplete}
            language={language}
          />
        );
      case "demographics":
        return (
          <DemographicsLongInternational
            storageName="demographics"
            onComplete={onSurveyComplete}
            language={language}
          />
        );
      case "result":
        return <Result experimentId={currentStep.experimentId} />;
    }
  };

  // ─── JSX ───────────────────────────────────────────────

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 pb-20 pt-4">
      <div className="max-w-3xl mx-auto">
        <form
          id="main-survey"
          onSubmit={(e) => {
            e.preventDefault();
            next();
          }}
        >
          {currentStep?.type !== "result" && (
            <ProgressBar
              currentStep={currentStepIndex + 1}
              totalSteps={steps.length - 1}
            />
          )}

          <div className="mt-4">{renderStep()}</div>

          {isStatementStep && (
            <div className="flex flex-col space-y-8 mt-12 pb-10">
              <nav
                className="flex items-center justify-between gap-4"
                aria-label="Survey navigation"
              >
                <button
                  onClick={back}
                  type="button"
                  className="flex-1 max-w-[140px] text-white bg-gradient-to-r from-sky-500 to-indigo-600
                    hover:from-sky-600 hover:to-indigo-700
                    focus:ring-4 focus:outline-none focus:ring-indigo-300
                    dark:focus:ring-indigo-800
                    font-semibold rounded-xl text-sm px-6 py-3.5 text-center
                    inline-flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30
                    transition-all duration-150 active:scale-95"
                >
                  {currentStepIndex === 0 ? (
                    <Link
                      to="/consent"
                      className="w-full h-full flex items-center justify-center"
                    >
                      {t("layout.start")}
                    </Link>
                  ) : (
                    t("layout.previous")
                  )}
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className={`flex-1 max-w-[200px] text-white bg-gradient-to-r from-sky-500 to-indigo-600
                    hover:from-sky-600 hover:to-indigo-700
                    focus:ring-4 focus:outline-none focus:ring-indigo-300
                    dark:focus:ring-indigo-800
                    font-semibold rounded-xl text-sm px-6 py-3.5 text-center
                    inline-flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30
                    transition-all duration-150 active:scale-95
                    ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isSaving
                    ? "Saving..."
                    : isLastStatement
                      ? t("layout.continue")
                      : t("layout.next")}
                </button>
              </nav>

              <div className="flex justify-center pt-4">
                <ScoreDisplay
                  score={currentScore}
                  currentStepIndex={currentStepIndex}
                />
              </div>
            </div>
          )}
        </form>
      </div>

      {isAuxSaving && (
        <div className="fixed inset-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              Saving…
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
