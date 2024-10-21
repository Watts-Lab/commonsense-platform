import { useEffect, useState, useRef } from "react";
import * as Plot from "@observablehq/plot";
import { useTranslation } from "react-i18next";

import Backend from "../apis/backend";
import TwitterText from "../utils/TwitterText";
import { useSession } from "../context/SessionContext";

function DashboardChart() {
  const {
    state: { sessionId },
  } = useSession();

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
          Number(Number(response.data.commonsensicality).toFixed(2)) * 100
        ),
        awareness: Math.round(
          Number(Number(response.data.awareness).toFixed(2)) * 100
        ),
        consensus: Math.round(
          Number(Number(response.data.consensus).toFixed(2)) * 100
        ),
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
      x: { percent: true, nice: true, domain: [0, 100] },
      y: { axis: false },
      color: { scheme: "Viridis" },
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
  }, [data]);

  const { t } = useTranslation();

  return (
    <div className="text-justify leading-relaxed px-4">
      <div className="flex justify-center items-start pb-4 gap-x-8">
        <div className="max-w-lg">
          <div className="h-52 rounded-2xl mx-auto">
            <div className="flex flex-col justify-center items-center h-full text-white">
              <div className="text-gray-600 pb-4 text-2xl">
                {/* Your score */}
                {t("dashboard-chart.your-score")}
              </div>
              <div
                className="radial-progress bg-gray-600 text-gray-300 border-4 border-gray-600"
                role="progressbar"
              >
                {commonSenseScore.commonsense}%
              </div>
            </div>
          </div>
          <p className="pb-4">
            {/* This score is based on a calculation of how similar your beliefs are
            to others (yours are {commonSenseScore.awareness}% similar), and how
            accurately you rated what others think (you were  {commonSenseScore.consensus}% accurate). */}
            {t("dashboard-chart.score-description", {
              awareness: commonSenseScore.awareness,
              consensus: commonSenseScore.consensus,
            })}
          </p>

          <p className="pb-4">
            {/* This is calculated by comparing your answers to others answers, so
            it will become more accurate if you answer more questions and it
            will become more accurate as others answer more questions. */}
            {t("dashboard-chart.calculated")}
          </p>
        </div>
      </div>

      <div className="flex justify-center mt-4" ref={containerRef} />

      <TwitterText
        percentage={commonSenseScore.commonsense}
        sessionId={sessionId}
      />
    </div>
  );
}

export default DashboardChart;
