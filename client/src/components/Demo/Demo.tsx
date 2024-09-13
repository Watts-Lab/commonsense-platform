import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import MultiStepForm from "../MultiStepForm";
import { questionData } from "../../data/questions";
import Backend from "../../apis/backend";

import "../style.css";
import DemoStatement from "./DemoStatements";
import DemoResult from "./DemoResults";

function Demo() {
  const [statementArray, setStatementArray] = useState([]);
  const [statementsData, setStatementsData] = useState([]);

  const [surveyLength, setSurveyLength] = useState(0);

  const urlParams = useSelector((state) => state.urlslice.urlParams);

  const [sessionId, setSessionId] = useState("");
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
      return response;
    } catch (error) {
      console.log(error);
    }
  };

  const pushResultComponent = (sessionIdResult) => {
    setStatementArray((oldArray) => [
      ...oldArray,
      <DemoResult key={oldArray.length} sessionId={sessionIdResult} />,
    ]);
  };

  const pushNewStatement = (statementId, statementText) => {
    setStatementsData((oldArray) => [
      ...oldArray,
      {
        id: statementId,
        answers: [
          "",
          "1-No answer iframe",
          "",
          "1-No answer iframe",
          "1-Yes",
          "",
        ],
        answereSaved: false,
      },
    ]);

    setStatementArray((oldArray) => [
      ...oldArray,
      <DemoStatement
        key={oldArray.length}
        next={next}
        back={back}
        currentStep={oldArray.length + 1}
        statementText={statementText}
        statementId={statementId}
        onChange={handleStatementChange}
        onSaveStatement={handleAnswerSaving}
        data={{
          id: statementId,
          answers: [
            "",
            "1-No answer iframe",
            "",
            "1-No answer iframe",
            "1-Yes",
            "",
          ],
          answereSaved: false,
        }}
        unansweredQuestionIndex={unansweredQuestionIndex}
      />,
    ]);
  };

  const { steps, setCurrentStepIndex, currentStepIndex, back, next } =
    MultiStepForm({
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

  useEffect(() => {
    (async () => {
      try {
        // First, get the sessionId
        const sessionResponse = await Backend.get("/", {
          withCredentials: true,
        });
        const incommingSessionId = sessionResponse.data;
        setSessionId(incommingSessionId);

        // Then, get the experiments data
        const experimentsResponse = await Backend.get("/experiments", {
          params: urlParams.reduce((acc, param) => {
            acc[param.key] = param.value;
            return acc;
          }, {}),
        });

        // Process the experiments data
        const initialAnswers = experimentsResponse.data.statements.map(
          (statement) => ({
            id: statement.id,
            answers: new Array(questionData.length).fill(""),
            answereSaved: false,
          })
        );
        setStatementsData(initialAnswers);

        setSurveyLength(5);
        setStatementArray(
          experimentsResponse.data.statements
            .slice(0, 5)
            .map(
              (
                statement: { statement: string; image?: string; id: number },
                index: number
              ) => {
                return (
                  <DemoStatement
                    key={index}
                    next={next}
                    back={back}
                    currentStep={index + 1}
                    totalSteps={5}
                    statementText={statement.statement}
                    imageUrl={statement.image}
                    statementId={statement.id}
                    onChange={handleStatementChange}
                    onSaveStatement={handleAnswerSaving}
                    data={{
                      id: statement.id,
                      answers: [
                        "",
                        "1-No answer iframe",
                        "",
                        "1-No answer iframe",
                        "1-Yes",
                        "",
                      ],
                      answereSaved: false,
                    }}
                    unansweredQuestionIndex={unansweredQuestionIndex}
                  />
                );
              }
            )
        );

        // Finally, push the result component
        pushResultComponent(incommingSessionId);
      } catch (error) {
        // Handle errors if any of the above operations fail
        console.error("An error occurred:", error);
      }
    })();
  }, []);

  const submitHandler = (event) => {
    event.preventDefault();
    next();
  };

  return (
    <>
      <form id="main-survey" onSubmit={submitHandler}>
        {statementArray[currentStepIndex]}

        {currentStepIndex < surveyLength && (
          <div className="flex justify-between float-end">
            {/* <button
              onClick={back}
              type="button"
              className="order-1 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              {(() => {
                if (currentStepIndex !== 0) {
                  return "← Previous";
                }
              })()}
            </button> */}

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

export default Demo;
