import React, { useEffect, useState, useRef } from "react";
import * as Plot from "@observablehq/plot";
import "./style.css";
import Backend from "../apis/backend";
import TwitterText from "../utils/TwitterText";
import NotificationBox from "../utils/NotificationBox";
import useStickyState from "../hooks/useStickyState";
import { useTranslation } from "react-i18next";
import ATurk from "./Reward/ATurk";
import BeSample from "./Reward/BeSample";
import { StatementData } from "./Layout";
import { useSession } from "../context/SessionContext";
import { rawData } from "../partials/Scores";

interface CRT {
  surveyName: string;
  responses: {
    drill_hammer: number;
    rachel: number;
    toaster: number;
    apples: number;
    eggs: number;
    dog_cat: number;
  };
  result: { score: number; normScore: number };
}

interface RmeTen {
  surveyName: string;
  responses: {
    rme_item_4: string;
    rme_item_6: string;
    rme_item_11: string;
    rme_item_15: string;
    rme_item_17: string;
    rme_item_22: string;
    rme_item_24: string;
    rme_item_27: string;
    rme_item_28: string;
    rme_item_29: string;
  };
  result: { score: number; normScore: number };
}

type ResultProps = { experimentId?: number };

const CRT_QUESTIONS: {
  key: keyof CRT["responses"];
  correctAnswer: number;
  intuitiveAnswer: number;
}[] = [
  {
    key: "drill_hammer",
    correctAnswer: 15,
    intuitiveAnswer: 30,
  },
  {
    key: "rachel",
    correctAnswer: 19,
    intuitiveAnswer: 20,
  },
  {
    key: "toaster",
    correctAnswer: 125,
    intuitiveAnswer: 120,
  },
  {
    key: "apples",
    correctAnswer: 15,
    intuitiveAnswer: 20,
  },
  {
    key: "eggs",
    correctAnswer: 11,
    intuitiveAnswer: 6,
  },
  {
    key: "dog_cat",
    correctAnswer: 72,
    intuitiveAnswer: 86,
  },
];

// ─── Animated counter ────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1400, enabled = true) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!enabled || target === 0) return;
    let raf: number;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, enabled]);
  return count;
}

// ─── Hero score card ─────────────────────────────────────────────────────────
function ScoreHero({
  loading,
  commonsense,
  awareness,
  consensus,
}: {
  loading: boolean;
  commonsense: number;
  awareness: number;
  consensus: number;
}) {
  const { t } = useTranslation();
  const animated = useCountUp(commonsense, 1400, !loading);

  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-sky-400 via-indigo-500 to-indigo-700 shadow-2xl mb-6">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-14 -left-14 w-56 h-56 rounded-full bg-white/5" />

      <div className="relative px-6 pt-8 pb-6">
        <p className="text-center text-white/50 text-xs font-semibold uppercase tracking-widest mb-6">
          {t("result.your-score-title")}
        </p>

        {/* Big number */}
        <div className="text-center mb-1">
          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-36 h-20 bg-white/10 rounded-2xl animate-pulse" />
              <div className="w-28 h-5 bg-white/10 rounded-full animate-pulse" />
            </div>
          ) : (
            <>
              <div className="flex items-end justify-center gap-2">
                <span
                  data-cy="commonsense-score"
                  className="text-8xl font-black text-white tabular-nums leading-none"
                  style={{ textShadow: "0 4px 24px rgba(0,0,0,0.25)" }}
                >
                  {animated}
                </span>
                <span className="text-2xl text-white/40 font-light mb-2">
                  /100
                </span>
              </div>
            </>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-5 mb-5 px-1">
          <div className="h-2.5 bg-white/15 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-300 to-white/70 rounded-full transition-all duration-1000 ease-out"
              style={{ width: loading ? "1%" : `${animated}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-white/25 text-xs">0</span>
            <span className="text-white/25 text-xs">100</span>
          </div>
        </div>

        {/* Sub-metrics */}
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              value: awareness,
              label1: t("result.belief"),
              label2: t("result.similarity"),
            },
            {
              value: consensus,
              label1: t("result.consensus-label"),
              label2: t("result.accuracy"),
            },
          ].map(({ value, label1, label2 }) => (
            <div
              key={label1}
              className="bg-white/10 rounded-2xl p-4 border border-white/10 text-center"
            >
              {loading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-9 bg-white/20 rounded w-2/3 mx-auto" />
                  <div className="h-3 bg-white/10 rounded w-3/4 mx-auto" />
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-white leading-none">
                    {value}
                    <span className="text-lg text-white/50">%</span>
                  </div>
                  <div className="text-white/50 text-xs mt-1.5 leading-tight">
                    {label1}
                    <br />
                    {label2}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
      {children}
    </h2>
  );
}

// ─── Info card ────────────────────────────────────────────────────────────────
function InfoCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 p-5 mb-5 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
      {children}
    </div>
  );
}

// ─── CRT breakdown ────────────────────────────────────────────────────────────
function CRTBreakdown({ crt }: { crt: CRT }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={(e) => {
          e.preventDefault();
          setOpen((o) => !o);
        }}
        className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium text-sm transition-colors"
      >
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
        {open ? t("result.hide-crt") : t("result.show-crt")}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {CRT_QUESTIONS.map((q) => {
            const userAnswer = Number(crt.responses[q.key]);
            const isCorrect = userAnswer === q.correctAnswer;
            const isIntuitive = !isCorrect && userAnswer === q.intuitiveAnswer;

            return (
              <div
                key={q.key}
                className={`rounded-xl p-4 border-l-4 ${
                  isCorrect
                    ? "bg-green-50 border-green-400 dark:bg-green-900/20 dark:border-green-500"
                    : isIntuitive
                      ? "bg-yellow-50 border-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-500"
                      : "bg-gray-50 border-gray-300 dark:bg-gray-800/40 dark:border-gray-600"
                }`}
              >
                <p className="text-sm text-gray-800 dark:text-gray-200 mb-3">
                  {t(`crt.${q.key}.question`)}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  <span
                    className={`inline-flex items-center gap-1 font-semibold ${
                      isCorrect
                        ? "text-green-700 dark:text-green-400"
                        : isIntuitive
                          ? "text-yellow-700 dark:text-yellow-400"
                          : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {isCorrect ? "✓" : isIntuitive ? "●" : "✗"}{" "}
                    {t("result.your-answer")}: {userAnswer}
                  </span>
                  {!isCorrect && (
                    <span className="text-green-700 dark:text-green-400 font-medium">
                      ✓ {t("result.correct-answer")}: {q.correctAnswer}
                    </span>
                  )}
                  {isIntuitive && (
                    <span className="text-yellow-600 dark:text-yellow-500 text-xs italic">
                      — {t(`crt.${q.key}.intuitiveExplanation`)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
function Result({ experimentId }: ResultProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_statementsData, setStatementsData] = useStickyState<StatementData[]>(
    [],
    "statementsData",
  );

  const {
    state: { sessionId, urlParams },
  } = useSession();

  const [commonSenseScore, setCommonSenseScore] = useState({
    commonsense: 0,
    awareness: 0,
    consensus: 0,
  });
  const [loadingResults, setLoadingResults] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [notifBox, setNotifBox] = useState(false);
  const [aTurkBox, setATurkBox] = useState(false);
  const [aTurkType, setATurkType] = useState<"mturk" | "besample" | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const [individualCRT] = useState<CRT | null>(() => {
    const s = localStorage.getItem("CRT");
    return s ? JSON.parse(s) : null;
  });
  const [individualRmeTen] = useState<RmeTen | null>(() => {
    const s = localStorage.getItem("rmeTen");
    return s ? JSON.parse(s) : null;
  });

  useEffect(() => {
    setLoadingResults(true);
    Backend.post("/results", { withCredentials: true, sessionId })
      .then((response) => {
        if (response.data.commonsensicality !== 0) {
          setCommonSenseScore({
            commonsense: Math.round(
              Number(Number(response.data.commonsensicality).toFixed(2)) * 100,
            ),
            awareness: Math.round(
              Number(Number(response.data.awareness).toFixed(2)) * 100,
            ),
            consensus: Math.round(
              Number(Number(response.data.consensus).toFixed(2)) * 100,
            ),
          });
        }
      })
      .finally(() => setLoadingResults(false));
  }, [sessionId]);

  useEffect(() => {
    setStatementsData([]);
    if (urlParams.find((o) => o.key === "source" && o.value === "mturk")) {
      setATurkBox(true);
      setATurkType("mturk");
    }
    if (
      urlParams.find((o) => o.key === "response_id") &&
      urlParams.find((o) => o.key === "assignment_id")
    ) {
      setATurkBox(true);
      setATurkType("besample");
    }
  }, []);

  useEffect(() => {
    if (!experimentId) return;
    Backend.post("/experiments/save", { sessionId, experimentId }).catch(
      console.error,
    );
  }, [sessionId, experimentId]);

  const [individualCommonsensicality, setIndividualCommonsensicality] =
    useState(
      rawData
        .sort((a, b) => a.commonsensicality - b.commonsensicality)
        .map((v) => ({ ...v, count: 1 })),
    );

  useEffect(() => {
    setIndividualCommonsensicality((prev) =>
      [
        ...prev,
        {
          sessionId: "You",
          commonsensicality: commonSenseScore.commonsense / 100,
          count: 1,
        },
      ].sort((a, b) => a.commonsensicality - b.commonsensicality),
    );
  }, [commonSenseScore]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const plot = Plot.plot({
      x: { percent: true, domain: [0, 100], clamp: true },
      y: { axis: false },
      color: { scheme: "Magma" },
      marks: [
        Plot.rectY(
          individualCommonsensicality,
          Plot.binX(
            {
              y: "count",
              fill: "x",
              fillOpacity: (
                bin: {
                  sessionId: string;
                  commonsensicality: number;
                  count: number;
                }[],
              ) => (bin.some((r) => r.sessionId === "You") ? 1 : 0.3),
            },
            { thresholds: 20, x: "commonsensicality" },
          ),
        ),
        Plot.ruleY([0]),
      ],
    });
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(plot);
    }
    return () => plot.remove();
  }, [commonSenseScore, individualCommonsensicality]);

  const signUp = async (email: string) => {
    try {
      await Backend.post(`/users/enter`, { email, sessionId });
    } catch (e) {
      console.error(e);
    }
  };

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const emailSubmit = () => {
    if (!userEmail) {
      setEmailError(t("result.email-required"));
      return;
    }
    if (!isValidEmail(userEmail)) {
      setEmailError(t("result.invalid-email"));
      return;
    }
    signUp(userEmail);
    setNotifBox(true);
  };

  async function handleCopy() {
    try {
      if (aTurkType === "besample") {
        const rid = urlParams.find((o) => o.key === "response_id")?.value;
        await navigator.clipboard.writeText(String(Number(rid) * 97819));
      } else if (aTurkType === "mturk") {
        await navigator.clipboard.writeText(sessionId);
      }
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (e) {
      console.error(e);
    }
  }

  const { t } = useTranslation();

  return (
    <div className="leading-relaxed">
      {/* ── Turk/BeSample reward boxes ── */}
      {aTurkBox &&
        (aTurkType === "mturk" ? (
          <ATurk
            sessionId={sessionId}
            handleCopy={handleCopy}
            copySuccess={copySuccess}
          />
        ) : aTurkType === "besample" ? (
          <BeSample
            responseId={
              urlParams.find((o) => o.key === "response_id")?.value || "0"
            }
            assignmentId={
              urlParams.find((o) => o.key === "assignment_id")?.value || "0"
            }
            handleCopy={handleCopy}
            copySuccess={copySuccess}
          />
        ) : null)}

      {/* ── Completion blurb ── */}
      <p className="py-4 text-justify text-gray-600 dark:text-gray-300">
        {t("result.completed-trial")}
      </p>

      {/* ── Hero score card ── */}
      <ScoreHero
        loading={loadingResults}
        commonsense={commonSenseScore.commonsense}
        awareness={commonSenseScore.awareness}
        consensus={commonSenseScore.consensus}
      />

      {/* ── Score explanation ── */}
      <InfoCard>
        <p className="mb-2">
          {t("result.score-description", {
            awareness: commonSenseScore.awareness,
            consensus: commonSenseScore.consensus,
          })}
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-xs">
          {t("result.score-calculation")}
        </p>
      </InfoCard>

      {/* ── Additional tests ── */}
      {individualCRT && individualRmeTen && (
        <div className="mb-6">
          <SectionLabel>{t("result.additional-tests")}</SectionLabel>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* CRT badge */}
            <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">
                CRT
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-indigo-600 dark:text-indigo-300 leading-none">
                  {individualCRT.result.score}
                </span>
                <span className="text-base text-indigo-300 dark:text-indigo-500 font-light">
                  /6
                </span>
              </div>
              <div className="mt-1.5 text-xs text-indigo-400 dark:text-indigo-500 leading-tight">
                {t("result.cognitive-reflection-test")}
              </div>
              {/* Mini pip row */}
              <div className="flex gap-1 mt-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full ${
                      i < individualCRT.result.score
                        ? "bg-indigo-400 dark:bg-indigo-400"
                        : "bg-indigo-100 dark:bg-indigo-800"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* RME badge */}
            <div className="rounded-2xl bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800 p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-violet-400 mb-2">
                RME
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-violet-600 dark:text-violet-300 leading-none">
                  {individualRmeTen.result.score}
                </span>
                <span className="text-base text-violet-300 dark:text-violet-500 font-light">
                  /10
                </span>
              </div>
              <div className="mt-1.5 text-xs text-violet-400 dark:text-violet-500 leading-tight">
                {t("result.reading-the-mind-in-the-eyes")}
              </div>
              {/* Mini pip row */}
              <div className="flex gap-1 mt-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full ${
                      i < individualRmeTen.result.score
                        ? "bg-violet-400 dark:bg-violet-400"
                        : "bg-violet-100 dark:bg-violet-800"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <InfoCard>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("result.score-crt-rmet", {
                CRT: individualCRT.result.score,
                RME: individualRmeTen.result.score,
              })}
            </p>
          </InfoCard>

          <CRTBreakdown crt={individualCRT} />
        </div>
      )}

      {/* ── Distribution chart ── */}
      <div className="mt-6 mb-4">
        <SectionLabel>{t("result.how-you-compare")}</SectionLabel>
        <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex justify-center" ref={containerRef} />
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">
            {t("result.highlighted-distribution")}
          </p>
        </div>
      </div>

      {/* ── Twitter share ── */}
      <TwitterText
        percentage={commonSenseScore.commonsense}
        sessionId={sessionId}
      />

      {/* ── Email signup ── */}
      <div className="mt-8 rounded-2xl bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-800 dark:to-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center shrink-0">
            <svg
              className="w-5 h-5 text-indigo-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              {t("result.create-account-1")}
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {t("result.track-score-updates")}
            </p>
          </div>
        </div>

        {notifBox ? (
          <NotificationBox userEmail={userEmail} />
        ) : (
          <div className="space-y-3">
            <div>
              <label
                htmlFor="email"
                className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("result.your-email")}
              </label>
              <input
                onChange={(e) => {
                  setUserEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                value={userEmail}
                type="email"
                name="email"
                id="email"
                className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white sm:text-sm rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent block w-full p-2.5 transition"
                placeholder={t("result.placeholder")}
                required
              />
              {emailError && (
                <span className="text-red-500 text-xs mt-1 block">
                  {emailError}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={emailSubmit}
              className="w-full text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800 font-medium rounded-xl text-sm px-5 py-2.5 text-center transition-all shadow-md shadow-indigo-200 dark:shadow-indigo-900/40"
            >
              {t("result.create-account-2")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Result;
