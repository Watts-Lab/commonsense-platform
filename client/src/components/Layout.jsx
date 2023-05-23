import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import axios from "axios";

// axios.defaults.baseURL = `http://localhost:8000`;

import Statement from "./Statement";
import MultiStepForm from "./MultiStepForm";
import Buttons from "./Buttons";
import Result from "./Result";

import "./style.css";


function Layout(props) {
  // const [listOfStatements, setListOfStatements] = useState([{id: 0, statement:'loading...'}]);

  const [statementArray, setStatementArray] = useState([]);
  const [statementsData, setStatementsData] = useState([]);
  const [sessionId, setSessionId] = useState();
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
      const { data: response } = await axios.get("/statements/test"); //use data destructuring to get data from the promise object
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
    axios
      .get("/answers/session/" + sessionId + "/statement/" + statementId)
      .then((response) => {
        console.log(response.data);
      });
  };

  useEffect(() => {
    axios
      .get("/statements")
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

        // setListOfStatements(response.data);

        return response;
      })
      .then((response) => {
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

    axios.get("/", { withCredentials: true }).then((response) => {
      //   console.log(response.data);
      setSessionId(response.data);
    });
  }, []);

  const submitHandler = (event) => {
    event.preventDefault();
    next();
    // console.log(statementsData);
  };

  return (
    <>
      <form onSubmit={submitHandler}>
        {statementArray[currentStepIndex]}

        <div className="flex justify-between">
          <button
            onClick={back}
            type="button"
            className="order-1 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            <svg
              aria-hidden="true"
              className="w-5 h-5 mr-2 -ml-1"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
              transform="matrix(-1,0,0,1,0,0)"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
            {(() => {
              if (props.currentStepIndex === 0) {
                return <Link to="/consent">Start</Link>;
              } else {
                return "Previous";
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
                return ("Finish")
              } else {
                return "Next";
              }
            })()}
            <svg
              aria-hidden="true"
              className="w-5 h-5 ml-2 -mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        </div>

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
