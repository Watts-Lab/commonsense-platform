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
import "./style.css";
import { toast } from "sonner";

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
      toast.error("Failed to save. Please check your connection and try again.");
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
    return (
      <>
        <ProgressBar currentStep={0} totalSteps={0} />
        <Statement
          statementText="Loading statement..."
          statementId={0}
          onChange={() => {}}
          data={{ answers: new Array(questionData.length).fill("") }}
          loading
        />
      </>
    );
  }

  return (
    <>
      <form
        id="main-survey"
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
      >
        {currentStep?.type !== "result" && (
          <ProgressBar
            currentStep={currentStepIndex + 1} // 1-based
            totalSteps={steps.length - 1} // exclude result step
          />
        )}

        {renderStep()}

        {isStatementStep && (
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between">
              <button
                onClick={back}
                type="button"
                className="order-1 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                {currentStepIndex === 0 ? (
                  <Link to="/consent">{t("layout.start")}</Link>
                ) : (
                  t("layout.previous")
                )}
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className={`order-last text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 ${
                  isSaving ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSaving
                  ? "Saving..."
                  : isLastStatement
                    ? t("layout.continue")
                    : t("layout.next")}
              </button>
            </div>

            <div className="flex justify-center">
              <ScoreDisplay
                score={currentScore}
                currentStepIndex={currentStepIndex}
              />
            </div>
          </div>
        )}
      </form>

      {isAuxSaving && (
        <div className="fixed inset-0 bg-white/80 z-50 flex items-center justify-center">
          <div className="text-xl font-black uppercase">Saving...</div>
        </div>
      )}
    </>
  );
}
