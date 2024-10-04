import React, { useEffect, useState, useRef } from "react";
import * as Plot from "@observablehq/plot";
import "./style.css";
import Backend from "../apis/backend";
import TwitterText from "../utils/TwitterText";
import NotificationBox from "../utils/NotificationBox";
import useStickyState from "../hooks/useStickyState";

import { statementStorageData } from "./Layout";
import { useSession } from "../context/SessionContext";

function Result() {
  const [_statementsData, setStatementsData] = useStickyState<
    statementStorageData[]
  >([], "statementsData");

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

  useEffect(() => {
    setLoadingResults(true);
    Backend.post("/results", {
      withCredentials: true,
      sessionId: sessionId,
    })
      .then((response) => {
        if (response.data.commonsensicality !== 0) {
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
        }
      })
      .finally(() => {
        setLoadingResults(false);
      });
  }, [sessionId]);

  useEffect(() => {
    setStatementsData([]);
    urlParams.forEach((obj) => {
      if (obj.key === "source" && obj.value === "mturk") {
        setATurkBox(true);
      }
    });
  }, []);

  // TODO: use the one from context
  const signUp = async (email: string, sessionId: string) => {
    try {
      await Backend.post(`/users/enter`, { email, sessionId });
    } catch (error) {
      console.error(error);
    }
  };

  const enterEmail = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setUserEmail(e.target.value);
    if (emailError) {
      setEmailError("");
    }
  };

  const isValidEmail = (email: string) => {
    // Simple regex for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const emailSubmit = () => {
    if (!userEmail) {
      setEmailError("Email is required.");
      return;
    }
    if (!isValidEmail(userEmail)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    // Proceed with the signup process
    signUp(userEmail, sessionId);
    setNotifBox(true);
  };

  // const containerRef = useRef();
  const [data, setData] = useState([]);
  const [individualCommonsensicality, setIndividualCommonsensicality] =
    useState([]);

  // useEffect(() => {
  //   if (sessionId) {
  //     Backend.get("/results/all", {
  //       withCredentials: true,
  //       params: {
  //         sessionId: sessionId,
  //       },
  //     })
  //       .then((response) => {
  //         setData(
  //           response.data.sort(
  //             (a, b) => a.commonsensicality - b.commonsensicality
  //           )
  //         );
  //         return response.data;
  //       })
  //       .then((data) => {
  //         setIndividualCommonsensicality(
  //           data.map((value, index) => ({
  //             sessionId: value.sessionId,
  //             commonsensicality: value.commonsensicality,
  //             count: 1,
  //           }))
  //         );
  //       });
  //   }
  // }, [sessionId]);

  // useEffect(() => {
  //   const plot = Plot.plot({
  //     x: { percent: true, domain: [0, 100], clamp: true },
  //     y: { axis: false },
  //     color: { scheme: "Magma" },
  //     marks: [
  //       Plot.rectY(
  //         individualCommonsensicality,
  //         Plot.binX(
  //           {
  //             y: "count",
  //             fill: "x",
  //             fillOpacity: (bin) =>
  //               bin.some((r) => r.sessionId === "You") ? 1 : 0.3,
  //           },
  //           {
  //             thresholds: 20,
  //             // stroke: "black",
  //             strokeOpacity: 0.2,
  //             x: "commonsensicality",
  //           }
  //         )
  //       ),
  //       Plot.ruleY([0]),
  //     ],
  //   });
  //   containerRef.current.append(plot);
  //   return () => plot.remove();
  // }, [data, individualCommonsensicality]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(sessionId);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  }

  return (
    <div className="text-justify leading-relaxed">
      {aTurkBox ? (
        <>
          <div className="flex flex-col items-center py-7">
            <p className="pb-2 text-3xl">Thanks for completing our survey!</p>
            <p className="pb-2">
              Copy the code below and paste it in the HIT as a completion
              verification:
            </p>
            <p className="pb-2 mb-3 font-semibold border-2 rounded py-1 px-3">
              {sessionId}
            </p>
            <button
              onClick={handleCopy}
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            >
              Copy code
            </button>
            <p className="text-2xl mt-3 pt-2 px-3">
              Scroll down to see your results — not required.
            </p>
          </div>
          <hr />
        </>
      ) : null}
      <p className="py-4">
        You&apos;ve completed the common sense trial. At any point you can
        answer more questions by logging in.
      </p>
      {loadingResults ? (
        <div className="flex justify-center pb-4">
          <div className="h-52 w-44 bg-gradient-to-t from-indigo-500 to-sky-500 rounded-2xl">
            <div className="flex flex-col justify-center items-center h-full text-white">
              <div className="text-pale-blue pb-4 text-2xl">Your Result</div>
              <div className="relative pt-3 h-24 w-24 flex justify-center items-center">
                <div className="animate-ping absolute inset-0 rounded-full bg-gradient-to-b from-sky-600 to-indigo-500"></div>
                <div className="z-10 text-center">
                  <div
                    data-cy="commonsense-score"
                    className="text-xs font-bold"
                  >
                    Calculating your score
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center pb-4">
          <div className="h-52 w-44 bg-gradient-to-t from-indigo-500 to-sky-500 rounded-2xl">
            <div className="flex flex-col justify-center items-center h-full text-white">
              <div className="text-pale-blue pb-4 text-2xl">Your Result</div>
              <div className="relative pt-3 h-24 w-24 flex justify-center items-center">
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-sky-600 to-indigo-500"></div>
                <div className="z-10 text-center">
                  <div
                    data-cy="commonsense-score"
                    className="text-4xl font-bold"
                  >
                    {commonSenseScore.commonsense}
                  </div>
                  <span className="text-pale-blue text-sm">of 100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <p className="pb-4">
        This score is based on a calculation of how similar your beliefs are to
        others (yours are {commonSenseScore.awareness}% similar), and how
        accurately you rated what others think (you were{" "}
        {commonSenseScore.consensus}% accurate).
      </p>
      <p className="pb-4">
        This is calculated by comparing your answers to others answers, so it
        will become more accurate if you answer more questions and it will
        become more accurate as others answer more questions. If you log in
        below you can continue to see this score as it updates over time.
      </p>
      {/* <div className="flex justify-center" ref={containerRef} /> */}
      <TwitterText
        percentage={commonSenseScore.commonsense}
        sessionId={sessionId}
      />
      <div className="flex flex-col items-center pt-7">
        <div className="w-full bg-white md:mt-0 sm:max-w-lg xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Create an account (optional)
            </h1>
            {notifBox ? (
              <NotificationBox userEmail={userEmail} />
            ) : (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Your email
                  </label>
                  <input
                    onChange={enterEmail}
                    value={userEmail}
                    type="email"
                    name="email"
                    id="email"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="name@company.com"
                    required
                  />
                  {emailError && (
                    <span className="text-red-500 text-sm">{emailError}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={emailSubmit}
                  className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                >
                  Create an account
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Result;
