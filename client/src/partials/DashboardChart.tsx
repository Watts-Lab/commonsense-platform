import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as Plot from "@observablehq/plot";
import { useSelector } from "react-redux";

import Backend from "../apis/backend";
import TwitterText from "../utils/TwitterText";

import { Radar } from "../components/RadarChart/Radar";
import { Histogram } from "./Histogram";

import useStickyState from "../hooks/useStickyState";

function DashboardChart(props) {
  const [statementsData, setStatementsData] = useStickyState(
    [],
    "statementsData"
  );

  const [commonSenseScore, setCommonSenseScore] = useState({
    commonsense: 0,
    awareness: 0,
    consensus: 0,
  });

  const [userEmail, setUserEmail] = useState("");
  const [notifBox, setNotifBox] = useState(false);

  const surveySession = useSelector((state) => state.login.surveySession);

  const urlParams = useSelector((state) => state.urlslice.urlParams);

  const navigateTo = useNavigate();

  const [aTurkBox, setATurkBox] = useState(false);

  function handleRedirect() {
    navigateTo("/welcome");
  }

  function isUserDone(statementsData) {
    for (let i = 0; i < statementsData.length; i++) {
      if (!statementsData[i].answereSaved) {
        return false;
      }
    }
    return true;
  }

  useEffect(() => {
    setStatementsData([]);

    Backend.post("/results", {
      withCredentials: true,
      sessionId: surveySession,
    }).then((response) => {
      console.log(response.data);
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
        sessionId: surveySession,
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
          data.map((value, index) => ({
            sessionId: value.sessionId,
            commonsensicality: value.commonsensicality,
            count: 1,
          }))
        );
      });
  }, []);

  useEffect(() => {
    const plot = Plot.plot({
      x: { percent: true, nice: true },
      y: { nice: true },
      style: {
        background: "#F9FAFB",
      },
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

  const data_radar = {
    behavior: 0.5,
    everyday: 0.8,
    "figure of speech": 0.2,
    judgment: 0.1,
    opinion: 0.9,
    reasoning: 0.7,

    name: "mercedes",
  };

  return (
    // <div className="text-justify leading-relaxed ">
    //   <div className="flex justify-center pb-4">
    //     <div className="h-52 w-44  rounded-2xl">
    //       <div className="flex flex-col justify-center items-center h-full text-white">
    //         <div className="text-gray-600 pb-4 text-2xl">Your score</div>
    //         <div
    //           className="radial-progress bg-gray-600 text-gray-300 border-4 border-gray-600"
    //           style={{ "--value": commonSenseScore.commonsense }}
    //           role="progressbar"
    //         >
    //           {commonSenseScore.commonsense}%
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    //   <p className="pb-4">
    //     This score is based on a calculation of how similar your beliefs are to
    //     others (yours are {commonSenseScore.awareness}% similar), and how
    //     accurately you rated what others think (you were
    //     {commonSenseScore.consensus}% accurate).
    //   </p>

    //   <p className="pb-4">
    //     This is calculated by comparing your answers to others answers, so it
    //     will become more accurate if you answer more questions and it will
    //     become more accurate as others answer more questions. If you log in
    //     below you can continue to see this score as it updates over time.
    //   </p>

    //   <div className="flex justify-center" ref={containerRef} />

    //   <TwitterText percentage={commonSenseScore.commonsense} />
    //   {aTurkBox ? (
    //     <div className="flex flex-col items-center pt-7">
    //       <p className="pb-2">Thanks for completing our survey!</p>
    //       <p className="pb-2">
    //         Copy the code below and paste it in the HIT as a completion
    //         verification:
    //       </p>
    //       <p className="pb-2 font-semibold border-2 rounded py-1 px-3">
    //         {props.sessionId}
    //       </p>
    //     </div>
    //   ) : null}
    // </div>
    <div className="text-justify leading-relaxed px-4">
      <div className="flex justify-center items-start pb-4 gap-x-8">
        <div className="w-1/2 max-w-xs">
          <div className="h-52 rounded-2xl mx-auto">
            <div className="flex flex-col justify-center items-center h-full text-white">
              <div className="text-gray-600 pb-4 text-2xl">Your score</div>
              <div
                className="radial-progress bg-gray-600 text-gray-300 border-4 border-gray-600"
                style={{ "--value": commonSenseScore.commonsense }}
                role="progressbar"
              >
                {commonSenseScore.commonsense}%
              </div>
            </div>
          </div>
          <p className="pt-4 text-center">
            This score is based on a calculation of how similar your beliefs are
            to others (yours are {commonSenseScore.awareness}% similar), and how
            accurately you rated what others think (you were
            {commonSenseScore.consensus}% accurate).
          </p>
        </div>

        <div className="w-1/2 max-w-xs">
          <Radar
            data={data_radar}
            width={450}
            height={350}
            axisConfig={[
              { name: "behavior", max: 1 },
              { name: "everyday", max: 1 },
              { name: "figure of speech", max: 1 },
              { name: "judgment", max: 1 },
              { name: "opinion", max: 1 },
              { name: "reasoning", max: 1 },
            ]}
          />
        </div>
      </div>

      <div className="flex justify-center mt-4" ref={containerRef} />

      <TwitterText percentage={commonSenseScore.commonsense} sessionId={surveySession}/>
      {aTurkBox && (
        <div className="flex flex-col items-center pt-7">
          <p className="pb-2">Thanks for completing our survey!</p>
          <p className="pb-2">
            Copy the code below and paste it in the HIT as a completion
            verification:
          </p>
          <p className="pb-2 font-semibold border-2 rounded py-1 px-3">
            {props.sessionId}
          </p>
        </div>
      )}
    </div>
  );
}

export default DashboardChart;
