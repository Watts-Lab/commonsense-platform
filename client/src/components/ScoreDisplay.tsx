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
      // Score increased → bounce up
      controls.start({
        scale: [1, 1.3, 0.95, 1.1, 1],
        rotate: [0, 5, -5, 0],
        transition: {
          duration: 0.8,
          type: "keyframes",
          ease: "easeInOut",
        },
      });
    } else if (score.commonsense < prevScoreRef.current) {
      // Score decreased → bounce down
      controls.start({
        scale: [1, 0.9, 1.05, 1],
        rotate: [0, -5, 5, 0],
        transition: {
          duration: 0.8,
          type: "keyframes",
          ease: "easeInOut",
        },
      });
    }

    prevScoreRef.current = score.commonsense;
  }, [score.commonsense, controls]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        <motion.span className="text-2xl font-bold" animate={controls}>
          {score.commonsense}/100
        </motion.span>
        <span className="relative inline-block cursor-help text-blue-500">
          <Tooltip
            className="order-last"
            placement="bottom"
            text="This is your commonsense score based on the answers you provided so far. This is calculated by comparing your answers to other people's answers."
          />
        </span>
      </div>
    </div>
  );
}

export default ScoreDisplay;
