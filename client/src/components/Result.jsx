import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as Plot from "@observablehq/plot";

import "./style.css";

import Backend from "../apis/backend";
import TwitterText from "../utils/TwitterText";
import NotificationBox from "../utils/NotificationBox";

function Result(props) {
  const [commonSenseScore, setCommonSenseScore] = useState(0);
  const [userEmail, setUserEmail] = useState("");
  const navigateTo = useNavigate();

  const ATurkBox = false;

  const [notifBox, setNotifBox] = useState(false);

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
    Backend.post("/results", null, {
      params: {
        sessionId: props.sessionId,
      },
    }).then((response) => {
      console.log(response.data);
      setCommonSenseScore(
        Math.round(Number(response.data.commonsensicality).toFixed(2) * 100)
      );
    });
  }, []);

  const signUp = async (email, sessionId) => {
    try {
      let res = await Backend.post(`/users/enter`, { email, sessionId });
      if (res.data.token) {
        login(res.data.token);
      } else {
        setNotifBox(true);
      }
    } catch (error) {
      // alert(error);
    }
  };

  const enterEmail = (e) => {
    setUserEmail(e.target.value);
  };

  const emailSubmit = (e) => {
    e.preventDefault();
    signUp(userEmail, props.sessionId);
    setNotifBox(true);
  };

  const containerRef = useRef();
  const [data, setData] = useState([]);
  const [individualCommonsensicality, setIndividualCommonsensicality] =
    useState([]);

  useEffect(() => {
    Backend.get("/results/all").then((response) => {
      setData(
        response.data.sort((a, b) => a.commonsensicality - b.commonsensicality)
      );
    });
  }, []);

  useEffect(() => {
    setIndividualCommonsensicality(
      data.map((value, index) => ({
        sessionId: value.sessionId,
        Percentile: index / data.length,
        count: 1,
      }))
    );

    const plot = Plot.plot({
      x: { percent: true, nice: true },
      y: { nice: true },
      marks: [
        Plot.rectY(
          individualCommonsensicality,
          Plot.binX(
            {
              y: "count",
              fill: (bin) => bin.some((r) => r.sessionId === "user16"),
            },
            {
              thresholds: 20,
              x: "Percentile",
            }
          )
        ),
        Plot.ruleY([0]),
      ],
    });
    containerRef.current.append(plot);
    return () => plot.remove();
  }, [data]);

  return (
    <div className="text-justify leading-relaxed">
      <p className="pb-4">
        You've completed the common sense trial. At any point you can answer
        more questions by logging in.
      </p>

      <div className="flex justify-center pb-4">
        <div className="h-52 w-44 bg-gradient-to-t from-indigo-500 to-sky-500 rounded-2xl">
          <div className="flex flex-col justify-center items-center h-full text-white">
            <div className="text-pale-blue pb-4 text-2xl">Your Result</div>
            <div className="rounded-full pt-3 h-24 w-24 justify-center text-center items-center bg-gradient-to-b from-sky-600 to-indigo-500">
              <div className="text-4xl font-bold">{commonSenseScore}</div>
              <span className="text-pale-blue text-sm">of 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* <p className="font-bold pb-2.5">
        Your common sense score is: {commonSenseScore}%.
      </p>
       */}
      <p className="pb-4">
        This score reflects the similarity of your beliefs to others, and the
        accuracy of your perceptions about what others believe.
      </p>
      <p className="pb-4">
        This is calculated by comparing your answers to others answers, so it
        will become more accurate if you answer more questions and it will
        become more accurate as others answer more questions. If you log in you
        can continue to see this score as it updates over time.
      </p>

      <div className="flex justify-center" ref={containerRef} />

      <TwitterText percentage={commonSenseScore} />

      {ATurkBox ? (
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
      ) : null}

      <div className="flex flex-col items-center pt-7">
        <div className="w-full bg-white md:mt-0 sm:max-w-lg xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Create an account
            </h1>

            {notifBox ? (
              <NotificationBox userEmail={userEmail} />
            ) : (
              <form onSubmit={emailSubmit} className="space-y-4 md:space-y-6">
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
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      aria-describedby="terms"
                      type="checkbox"
                      className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                      required
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="terms"
                      className="font-light text-gray-500 dark:text-gray-300"
                    >
                      I accept the{" "}
                      <a
                        className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                        href="#"
                      >
                        Terms and Conditions
                      </a>
                    </label>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                >
                  Create an account
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Result;
