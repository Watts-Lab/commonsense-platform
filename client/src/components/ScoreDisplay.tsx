import { useEffect, useRef, useMemo } from "react";
import { motion, useAnimation } from "framer-motion";
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
        transition: { duration: 0.8, type: "spring", stiffness: 300 },
      });
    } else if (score.commonsense < prevScoreRef.current) {
      controls.start({
        scale: [1, 0.9, 1.05, 1],
        rotate: [0, -5, 5, 0],
        transition: { duration: 0.8, type: "spring", stiffness: 300 },
      });
    }
    prevScoreRef.current = score.commonsense;
  }, [score.commonsense, controls]);

  const scoreColor = useMemo(() => {
    const percent = Math.max(0, Math.min(100, score.commonsense));
    let r, g, b;
    if (percent < 50) {
      r = 255;
      g = Math.round(percent * 5.1);
      b = 60;
    } else {
      r = Math.round(255 - (percent - 50) * 4.1);
      g = 180 + Math.round((percent - 50) * 1.5);
      b = 60 + Math.round((percent - 50) * 1.2);
    }
    return `rgb(${r},${g},${b})`;
  }, [score.commonsense]);

  if (typeof currentStepIndex === "number" && currentStepIndex < 5) {
    return (
      <div className="py-4 flex items-center justify-center">
        <span className="text-md text-gray-600 text-center">
          You will get a{" "}
          <span className="font-semibold text-indigo-600">
            live commonsense score{" "}
          </span>
          here after rating 5 statements.
        </span>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="flex items-center justify-center space-x-2">
        <h3 className="text-lg font-semibold">Your score so far:</h3>
        <motion.span
          className="text-2xl font-bold"
          style={{
            color: scoreColor,
            textShadow: "0 5px 4px rgba(0,0,0,0.15)",
          }}
          animate={controls}
        >
          {score.commonsense}/100
        </motion.span>
        <span className="relative inline-block cursor-help text-blue-500">
          <Tooltip
            className="order-last"
            placement="bottom"
            text="This is your commonsense score based on the answers provided so far. This is calculated by comparing your answers to others answers."
          />
        </span>
      </div>
      <div className="flex justify-center space-x-4 mt-2">
        <div className="text-sm bg-blue-100 p-1 rounded relative group cursor-help">
          Awareness: {score.awareness}%
          <span className="absolute left-1/2 -translate-x-1/2 mt-2 z-10 hidden group-hover:block bg-white border border-gray-300 text-gray-700 text-xs rounded px-2 py-1 shadow-lg whitespace-pre-line w-56">
            Awareness is how similar your beliefs are to others.
          </span>
        </div>
        <div className="text-sm bg-green-100 p-1 rounded relative group cursor-help">
          Consensus: {score.consensus}%
          <span className="absolute left-1/2 -translate-x-1/2 mt-2 z-10 hidden group-hover:block bg-white border border-gray-300 text-gray-700 text-xs rounded px-2 py-1 shadow-lg whitespace-pre-line w-56">
            Consensus is how accurately you are at guessing other beliefs of
            common sense.
          </span>
        </div>
      </div>
    </div>
  );
}

export default ScoreDisplay;
