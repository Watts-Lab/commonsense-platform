import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { setSession } from "../redux/slices/loginSlice";

import Statement from "./Statement";
import MultiStepForm from "./MultiStepForm";
import Buttons from "./Buttons";
import Result from "./Result";
import Feedback from "./Feedback/Feedback";

import useStickyState from "../hooks/useStickyState";

import Backend from "../apis/backend";

import "./style.css";

function Layout(props) {
  const [statementArray, setStatementArray] = useState([]);
  const [statementsData, setStatementsData] = useStickyState(
    [],
    "statementsData"
  );

  const [surveyLength, setSurveyLength] = useState(0);

  const surveySession = useSelector((state) => state.login.surveySession);
  const urlParams = useSelector((state) => state.urlslice.urlParams);

  const [sessionId, setSessionId] = useStickyState(null, "surveySessionId");
  const [unansweredQuestionIndex, setUnansweredQuestionIndex] = useState(null);

  const handleAnswerSaving = (tid, answerState) => {
    setStatementsData((prevState) =>
      prevState.map((data) =>
        data.id === tid
          ? { id: tid, answers: data.answers, answereSaved: answerState }
          : data
      )
    );
  };

  const getNextStatement = async (sessionId) => {
    try {
      const { data: response } = await Backend.get("/treatments", {
        withCredentials: true,
        params: { sessionId: sessionId },
      });
      console.log("new fetched statement:", response);
      return response;
    } catch (error) {
      console.log(error);
    }
  };

  const pushResultComponent = (statementId, statementText) => {
    console.log("adding Result component");
    let finalSessionId = surveySession ? surveySession : sessionId;
    setStatementArray((oldArray) => [
      ...oldArray,
      <Result
        key={oldArray.length}
        sessionId={finalSessionId}
        showSignUpBox={true}
      />,
    ]);
  };

  const pushNewStatement = (statementId, statementText) => {
    console.log("adding new statement");

    setStatementsData((oldArray) => [
      ...oldArray,
      {
        id: statementId,
        answers: ["", "", "", "", "", ""],
        answereSaved: false,
      },
    ]);

    setStatementArray((oldArray) => [
      ...oldArray,
      <Statement
        key={oldArray.length}
        next={next}
        back={back}
        currentStep={oldArray.length + 1}
        statementText={statementText}
        statementId={statementId}
        onChange={handleStatementChange}
        onSaveStatement={handleAnswerSaving}
        data={
          statementsData[oldArray.length] || {
            id: statementId,
            answers: ["", "", "", "", "", ""],
            answereSaved: false,
          }
        }
        unansweredQuestionIndex={unansweredQuestionIndex}
      />,
    ]);
  };

  const { steps, currentStepIndex, back, next } = MultiStepForm({
    steps: statementsData,
    sessionId: surveySession ? surveySession : sessionId,
    handleAnswerSaving: handleAnswerSaving,
    getNextStatement: getNextStatement,
    pushNewStatement: pushNewStatement,
    pushResultComponent: pushResultComponent,
    setUnansweredQuestionIndex: setUnansweredQuestionIndex,
  });

  const handleStatementChange = (tid, updatedData) => {
    setStatementsData((prevState) =>
      prevState.map((data) =>
        data.id === tid
          ? { id: tid, answers: updatedData, answereSaved: data.answereSaved }
          : data
      )
    );
  };

  useEffect(() => {
    Backend.get("/treatments", {
      params: urlParams.reduce((acc, param) => {
        acc[param.key] = param.value;
        return acc;
      }, {}),
    })
      .then((response) => {
        console.log(response.data);
        setStatementsData(
          response.data.value.map((statement) => {
            return {
              id: statement.id,
              answers: ["", "", "", "", "", ""],
              answereSaved: false,
            };
          })
        );

        return response;
      })
      .then((response) => {
        localStorage.setItem("statementsData", JSON.stringify(statementsData));

        setSurveyLength(response.data.value.length);

        setStatementArray(
          response.data.value.map((statement, index) => {
            return (
              <Statement
                key={index}
                next={next}
                back={back}
                currentStep={index + 1}
                totalSteps={response.data.value.length}
                statementText={statement.statement}
                imageUrl={statement.image}
                statementId={statement.id}
                onChange={handleStatementChange}
                onSaveStatement={handleAnswerSaving}
                data={
                  statementsData[index] || {
                    id: statement.id,
                    answers: ["", "", "", "", "", ""],
                    answereSaved: false,
                  }
                }
                unansweredQuestionIndex={unansweredQuestionIndex}
              />
            );
          })
        );
      })
      .then(() => {
        pushResultComponent();
      });

    Backend.get("/", { withCredentials: true }).then((response) => {
      setSessionId(response.data);
      if (!surveySession) {
        setSession({
          surveySession: "jjjj",
        });
      }
    });
  }, []);

  const submitHandler = (event) => {
    event.preventDefault();
    next();
  };

  return (
    <>
      <form onSubmit={submitHandler}>
        {statementArray[currentStepIndex]}

        {currentStepIndex < surveyLength && (
          <div className="flex justify-between">
            <button
              onClick={back}
              type="button"
              className="order-1 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              {(() => {
                if (props.currentStepIndex === 0) {
                  return <Link to="/consent">Start</Link>;
                } else {
                  return "← Previous";
                }
              })()}
            </button>

            <button
              type="submit"
              className="order-last text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              {(() => {
                if (currentStepIndex === surveyLength - 1) {
                  // return <Link to="/finish">Finish</Link>;
                  return "Finish";
                } else {
                  return "Next →";
                }
              })()}
            </button>
          </div>
        )}
      </form>
    </>
  );
}

export default Layout;
