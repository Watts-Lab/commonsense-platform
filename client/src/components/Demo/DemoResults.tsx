import { useEffect, useState, useRef } from "react";
import * as Plot from "@observablehq/plot";
import "../style.css";
import Backend from "../../apis/backend";

type ResultProps = {
  sessionId: string;
};

function DemoResult({ sessionId }: ResultProps) {
  const [commonSenseScore, setCommonSenseScore] = useState({
    commonsense: 0,
    awareness: 0,
    consensus: 0,
  });

  useEffect(() => {
    Backend.post("/results", {
      withCredentials: true,
      sessionId: sessionId,
    }).then((response) => {
      setCommonSenseScore({
        commonsense: Math.round(
          Number(response.data.commonsensicality).toFixed(2) * 100
        ),
        awareness: Math.round(Number(response.data.awareness).toFixed(2) * 100),
        consensus: Math.round(Number(response.data.consensus).toFixed(2) * 100),
      });
    });
  }, []);

  const containerRef = useRef();
  const [data, setData] = useState([]);
  const [individualCommonsensicality, setIndividualCommonsensicality] =
    useState([]);

  useEffect(() => {
    Backend.get("/results/all", {
      withCredentials: true,
      params: {
        sessionId: sessionId,
      },
    })
      .then((response) => {
        setData(
          response.data.sort(
            (a, b) => a.commonsensicality - b.commonsensicality
          )
        );
        return response.data;
      })
      .then((data) => {
        setIndividualCommonsensicality(
          data.map(
            (value: { sessionId: string; commonsensicality: number }) => ({
              sessionId: value.sessionId,
              commonsensicality: value.commonsensicality,
              count: 1,
            })
          )
        );
      });
  }, []);

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
              fillOpacity: (bin) =>
                bin.some((r) => r.sessionId === "You") ? 1 : 0.3,
            },
            {
              thresholds: 20,
              // stroke: "black",
              strokeOpacity: 0.2,
              x: "commonsensicality",
            }
          )
        ),
        Plot.ruleY([0]),
      ],
    });
    containerRef.current.append(plot);
    return () => plot.remove();
  }, [data, individualCommonsensicality]);

  return (
    <div className="text-justify leading-relaxed">
      <p className="py-4">You've completed the common sense trial.</p>
      <div className="flex justify-center pb-4">
        <span className="font-bold text-3xl">
          {commonSenseScore.commonsense}/100
        </span>
      </div>
      <p className="pb-4">
        This score is based on a calculation of how similar your beliefs are to
        others — yours are {commonSenseScore.awareness}% similar, and how
        accurately you rated what others think — you were{" "}
        {commonSenseScore.consensus}% accurate. This is calculated by comparing
        your answers to others answers, so it will become more accurate if you
        answer more questions and it will become more accurate as others answer
        more questions.
      </p>
      <div className="flex justify-center" ref={containerRef} />
      <div className="flex flex-col items-center pt-7">
        <div className="w-full bg-white md:mt-0 sm:max-w-lg xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <h1 className="text-md text-gray-900 dark:text-white">
            To take the full survey, visit{" "}
            <a
              className="text-blue-700 dark:text-blue-400 pb-4"
              href="https://commonsense.seas.upenn.edu/?utm_source=newscientist&utm_id=sessionId"
            >
              commonsense.seas.upenn.edu
            </a>
          </h1>
        </div>
      </div>
    </div>
  );
}

export default DemoResult;
