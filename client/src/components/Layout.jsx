import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import Statement from "./Statement";
import MultiStepForm from "./MultiStepForm";
import Buttons from "./Buttons";
import Result from "./Result";

import useStickyState from "../hooks/useStickyState";

import Backend from "../apis/backend";

import "./style.css";

function Layout(props) {
  // const [listOfStatements, setListOfStatements] = useState([{id: 0, statement:'loading...'}]);

  const [statementArray, setStatementArray] = useState([]);
  const [statementsData, setStatementsData] = useStickyState(
    [],
    "statementsData"
  );
  
  const [sessionId, setSessionId] = useStickyState(
    null,
    "surveySessionId"
  );
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
      const { data: response } = await Backend.get("/statements/test");
      console.log("new fetched statement:", response[0]);
      return response;
    } catch (error) {
      console.log(error);
    }
  };

  const pushResultComponent = (statementId, statementText) => {
    console.log("adding Result component");

    setStatementArray((oldArray) => [
      ...oldArray,
      <Result key={oldArray.length} sessionId={sessionId} />,
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
    sessionId: sessionId,
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

  const getUserLastAnswer = (sessionId, statementId) => {
    Backend.get(
      "/answers/session/" + sessionId + "/statement/" + statementId
    ).then((response) => {
      console.log(response.data);
    });
  };

  useEffect(() => {
    Backend.get("/statements")
      .then((response) => {
        setStatementsData(
          response.data.map((statement) => {
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

        setStatementArray(
          response.data.map((statement, index) => {
            return (
              <Statement
                key={index}
                next={next}
                back={back}
                currentStep={index + 1}
                statementText={statement.statement}
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
      });

    Backend.get("/", { withCredentials: true }).then((response) => {
      //   console.log(response.data);
      setSessionId(response.data);
    });
  }, []);

  // useEffect(() => {
  //   localStorage.setItem("statementsData", JSON.stringify(statementsData));
  //   console.log(JSON.parse(localStorage.getItem("statementsData")));
  // }, [statementsData]);

  const submitHandler = (event) => {
    event.preventDefault();
    next();
    // console.log(statementsData);
  };

  return (
    <>
      <form onSubmit={submitHandler}>
        {statementArray[currentStepIndex]}

        {currentStepIndex < 15 && (
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
                if (currentStepIndex === 14) {
                  // return <Link to="/finish">Finish</Link>;
                  return "Finish";
                } else {
                  return "Next →";
                }
              })()}
            </button>
          </div>
        )}

        {/* <Buttons
          currentStep={currentStepIndex}
          getNextStatement={getNextStatement}
          next={next}
          back={back}
        /> */}
      </form>
    </>
  );
}

export default Layout;
