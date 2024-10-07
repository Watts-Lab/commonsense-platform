import { ReactNode, useEffect, useState } from "react";
import { Link } from "react-router-dom";
// @ts-expect-error no types available
import { CRT, RmeTen, Demographics } from "@watts-lab/surveys";
import Statement from "./Statement";
import MultiStepForm from "./MultiStepForm";
import Result from "./Result";
import { questionData } from "../data/questions";
import useStickyState from "../hooks/useStickyState";
import Backend from "../apis/backend";

import "./style.css";
import ProgressBar from "./ProgressBar";
import { useSession } from "../context/SessionContext";

export type statementStorageData = {
  id: number;
  answers: string[];
  answereSaved: boolean;
};

function Layout() {
  const [statementArray, setStatementArray] = useState<ReactNode[]>([]);
  const [statementsData, setStatementsData] = useStickyState<
    statementStorageData[]
  >([], "statementsData");

  const [surveyLength, setSurveyLength] = useState(0);

  const {
    state: { sessionId, urlParams },
  } = useSession();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onCompleteCallback = (record: any) => {
    Backend.post("/experiments/individual", {
      sessionId: sessionId,
      informationType: record.surveyName,
      experimentInfo: record,
    }).finally(() => {
      setCurrentStepIndex((i) => i + 1);
      if (record.surveyName !== "demographics") {
        localStorage.setItem(record.surveyName, JSON.stringify(record));
      }
    });
  };

  const handleAnswerSaving = (tid: number, answerState: boolean) => {
    setStatementsData((prevState) =>
      prevState.map((data) =>
        data.id === tid
          ? { id: tid, answers: data.answers, answereSaved: answerState }
          : data
      )
    );
  };

  const pushResultComponent = (experimentId: number) => {
    setStatementArray((oldArray) => [
      ...oldArray,
      <CRT key="crt" onComplete={onCompleteCallback} />,
      <RmeTen key="rmet" onComplete={onCompleteCallback} />,
      <Demographics key="demographic" onComplete={onCompleteCallback} />,
      <Result key={oldArray.length} experimentId={experimentId} />,
    ]);
  };

  const pushNewStatement = (statementId: number, statementText: string) => {
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
        statementText={statementText}
        statementId={statementId}
        onChange={handleStatementChange}
        data={
          statementsData[oldArray.length] || {
            id: statementId,
            answers: ["", "", "", "", "", ""],
            answereSaved: false,
          }
        }
      />,
    ]);
  };

  const { setCurrentStepIndex, currentStepIndex, back, next } = MultiStepForm({
    steps: statementsData,
    handleAnswerSaving: handleAnswerSaving,
    pushNewStatement: pushNewStatement,
  });

  const handleStatementChange = (tid: number, updatedData: string[]) => {
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
      // Only fetch if sessionId is not set
      try {
        // Then, get the experiments data
        const experimentsResponse = await Backend.get("/experiments", {
          params: {
            sessionId: sessionId,
            ...urlParams.reduce(
              (
                acc: Record<string, string>,
                param: { key: string; value: string }
              ) => {
                acc[param.key] = param.value;
                return acc;
              },
              {}
            ),
          },
        });

        // Process the experiments data
        const initialAnswers = experimentsResponse.data.statements.map(
          (statement: { id: number }) => ({
            id: statement.id,
            answers: new Array(questionData.length).fill(""),
            answereSaved: false,
          })
        );
        setStatementsData(initialAnswers);

        setSurveyLength(experimentsResponse.data.statements.length + 3);

        setStatementArray(
          experimentsResponse.data.statements.map(
            (
              statement: { statement: string; image?: string; id: number },
              index: number
            ) => {
              return (
                <Statement
                  key={index}
                  statementText={statement.statement}
                  imageUrl={statement.image}
                  statementId={statement.id}
                  onChange={handleStatementChange}
                  data={
                    statementsData[index] || {
                      id: statement.id,
                      answers: ["", "", "", "", "", ""],
                      answereSaved: false,
                    }
                  }
                />
              );
            }
          )
        );

        // Finally, push the result component
        pushResultComponent(experimentsResponse.data.experimentId);
      } catch (error) {
        // Handle errors if any of the above operations fail
        console.error("An error occurred:", error);
      }
    })();
  }, [sessionId]);

  const submitHandler = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    next();
  };

  return (
    <>
      <form id="main-survey" onSubmit={submitHandler}>
        {currentStepIndex !== surveyLength ? (
          <ProgressBar
            currentStep={currentStepIndex}
            totalSteps={surveyLength}
          />
        ) : null}
        {statementArray[currentStepIndex]}

        {currentStepIndex < surveyLength - 3 && (
          <div className="flex justify-between">
            <button
              onClick={back}
              type="button"
              className="order-1 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              {(() => {
                if (currentStepIndex === 0) {
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
                if (currentStepIndex === surveyLength - 3) {
                  // return <Link to="/finish">Finish</Link>;
                  return "Continue";
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
