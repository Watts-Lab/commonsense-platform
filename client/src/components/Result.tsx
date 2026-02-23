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
  result: {
    score: number;
    normScore: number;
  };
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
  result: {
    score: number;
    normScore: number;
  };
}

type ResultProps = {
  experimentId?: number;
};

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

  // CRT and rmeTen
  const [individualCRT] = useState<CRT | null>(() => {
    const storedParams = localStorage.getItem("CRT");
    if (storedParams) {
      return JSON.parse(storedParams);
    }
    return null;
  });

  const [individualRmeTen] = useState<RmeTen | null>(() => {
    const storedParams = localStorage.getItem("rmeTen");
    if (storedParams) {
      return JSON.parse(storedParams);
    }
    return null;
  });

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
      .finally(() => {
        setLoadingResults(false);
      });
  }, [sessionId]);

  useEffect(() => {
    setStatementsData([]);
    if (
      urlParams.find((obj) => obj.key === "source" && obj.value === "mturk")
    ) {
      setATurkBox(true);
      setATurkType("mturk");
    }
    const hasResponseId = urlParams.find((obj) => obj.key === "response_id");
    const hasAssignmentId = urlParams.find(
      (obj) => obj.key === "assignment_id",
    );
    if (hasResponseId && hasAssignmentId) {
      setATurkBox(true);
      setATurkType("besample");
    }
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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

  const containerRef = useRef<HTMLDivElement>(null);
  const [individualCommonsensicality, setIndividualCommonsensicality] =
    useState(
      rawData
        .sort((a, b) => a.commonsensicality - b.commonsensicality)
        .map((value) => ({ ...value, count: 1 })),
    );

  useEffect(() => {
    const alldata = [
      ...individualCommonsensicality,
      {
        sessionId: "You",
        commonsensicality: commonSenseScore.commonsense / 100,
        count: 1,
      },
    ].sort((a, b) => a.commonsensicality - b.commonsensicality);

    setIndividualCommonsensicality(alldata);
  }, [commonSenseScore]);

  useEffect(() => {
    const saveExperiment = async () => {
      try {
        await Backend.post("/experiments/save", {
          sessionId,
          experimentId,
        });
      } catch (error) {
        console.error("Failed to save experiment:", error);
      }
    };

    if (experimentId) {
      saveExperiment();
    }
  }, [sessionId, experimentId]);

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
            {
              thresholds: 20,
              // stroke: "black",
              x: "commonsensicality",
            },
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

  async function handleCopy() {
    try {
      if (aTurkType === "besample") {
        const responseId = urlParams.find(
          (obj) => obj.key === "response_id",
        )?.value;

        const BeSampleId = 97819;
        await navigator.clipboard.writeText(
          String(Number(responseId) * BeSampleId),
        );
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
        return;
      } else if (aTurkType === "mturk") {
        await navigator.clipboard.writeText(sessionId);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
        return;
      }
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  }

  const { t } = useTranslation();

  return (
    <div className="text-justify leading-relaxed">
      {aTurkBox ? (
        aTurkType === "mturk" ? (
          <ATurk
            sessionId={sessionId}
            handleCopy={handleCopy}
            copySuccess={copySuccess}
          />
        ) : aTurkType === "besample" ? (
          <BeSample
            responseId={
              urlParams.find((obj) => obj.key === "response_id")?.value || "0"
            }
            assignmentId={
              urlParams.find((obj) => obj.key === "assignment_id")?.value || "0"
            }
            handleCopy={handleCopy}
            copySuccess={copySuccess}
          />
        ) : null
      ) : null}
      <p className="py-4">
        {/* You&apos;ve completed the common sense trial. At any point you can
        answer more questions by logging in. */}
        {t("result.completed-trial")}
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
                  <span className="text-pale-blue text-sm">
                    {/* of 100 */}
                    {t("result.of-100")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <p className="pb-4">
        {/* This score is based on a calculation of how similar your beliefs are to
        others (yours are {commonSenseScore.awareness}% similar), and how
        accurately you rated what others think (you were{" "}
        {commonSenseScore.consensus}% accurate). */}
        {t("result.score-description", {
          awareness: commonSenseScore.awareness,
          consensus: commonSenseScore.consensus,
        })}
      </p>
      <p className="pb-4">
        {/* This is calculated by comparing your answers to others answers, so it
        will become more accurate if you answer more questions and it will
        become more accurate as others answer more questions. If you log in
        below you can continue to see this score as it updates over time. */}
        {t("result.score-calculation")}
      </p>
      {individualCRT && individualRmeTen && (
        <p className="pb-4">
          {/* You have also completed the Cognitive Reflection Test (CRT) and the
          Reading the Mind in the Eyes Test (RMET). You scored{" "}
          <span className="font-bold text-blue-700 dark:text-blue-400 dark:text-opacity-80">
            {individualCRT.result.score}/6
          </span>{" "}
          on the CRT and{" "}
          <span className="font-bold text-blue-700 dark:text-blue-400 dark:text-opacity-80">
            {individualRmeTen.result.score}/10
          </span>{" "}
          on the RME. These scores do not affect your common sense score but
          measure different aspects of your thinking. */}
          {t("result.score-crt-rmet", {
            CRT: individualCRT.result.score,
            RME: individualRmeTen.result.score,
          })}
        </p>
      )}

      <div className="flex justify-center" ref={containerRef} />
      <TwitterText
        percentage={commonSenseScore.commonsense}
        sessionId={sessionId}
      />
      <div className="flex flex-col items-center pt-7">
        <div className="w-full bg-white md:mt-0 sm:max-w-lg xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              {/* Create an account (optional) */}
              {t("result.create-account-1")}
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
                    {/* Your email */}
                    {t("result.your-email")}
                  </label>
                  <input
                    onChange={enterEmail}
                    value={userEmail}
                    type="email"
                    name="email"
                    id="email"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder={t("result.placeholder")}
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
                  {/* Create an account */}
                  {t("result.create-account-2")}
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
