import { useEffect, useRef } from "react";
import { motion, useAnimation } from "motion/react";
import Tooltip from "./Tooltip";

type ScoreDisplayProps = {
  score: {
    commonsense: number;
    awareness: number;
    consensus: number;
  };
  currentStepIndex?: number;
};

function ScoreDisplay({ score, currentStepIndex }: ScoreDisplayProps) {
  const controls = useAnimation();
  const prevScoreRef = useRef(score.commonsense);

  useEffect(() => {
    if (score.commonsense > prevScoreRef.current) {
      controls.start({
        scale: [1, 1.3, 0.95, 1.1, 1],
        rotate: [0, 5, -5, 0],
        transition: { duration: 0.8, type: "keyframes", ease: "easeInOut" },
      });
    } else if (score.commonsense < prevScoreRef.current) {
      controls.start({
        scale: [1, 0.9, 1.05, 1],
        rotate: [0, -5, 5, 0],
        transition: { duration: 0.8, type: "keyframes", ease: "easeInOut" },
      });
    }
    prevScoreRef.current = score.commonsense;
  }, [score.commonsense, controls]);

  /* ── Not enough answers yet ─────────────────────────────────────────────── */
  if (typeof currentStepIndex === "number" && currentStepIndex < 5) {
    return (
      <div className="py-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-sm text-indigo-600 dark:border-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400">
          {/* bar-chart icon */}
          <svg
            className="h-4 w-4 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <span>
            Live <span className="font-semibold">commonsense score</span>{" "}
            unlocks after 5 statements
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xs py-3">
      <div className="relative rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-500 px-5 py-4 shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/40">
        {/* Decorative elements clipping layer */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
          aria-hidden="true"
        >
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10" />
        </div>

        <div className="relative z-10 flex items-center justify-between gap-4">
          {/* Main score */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
              Score so far
            </p>
            <motion.div
              className="mt-0.5 flex items-baseline gap-1"
              animate={controls}
            >
              <span className="text-4xl font-black leading-none tabular-nums text-white">
                {score.commonsense}
              </span>
              <span className="text-base font-light text-white/50">/100</span>
            </motion.div>
          </div>

          {/* Sub-scores + tooltip */}
          <div className="flex flex-col items-end gap-1.5 text-right">
            <div className="text-xs">
              <span className="font-semibold text-white">
                {score.awareness}%
              </span>
              <span className="ml-1 text-white/50">similar</span>
            </div>
            <div className="text-xs">
              <span className="font-semibold text-white">
                {score.consensus}%
              </span>
              <span className="ml-1 text-white/50">accurate</span>
            </div>
            <Tooltip
              className="order-last mt-0.5 text-white/50 transition-colors hover:text-white"
              placement="top"
              text="This is your commonsense score based on the answers you provided so far. Calculated by comparing your answers to other people's answers."
            />
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative z-10 mt-3.5 h-1.5 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-white/70 transition-all duration-700 ease-out"
            style={{ width: `${score.commonsense}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default ScoreDisplay;
