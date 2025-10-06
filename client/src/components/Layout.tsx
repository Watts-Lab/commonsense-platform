import { ReactNode, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
// @ts-expect-error no types available
import { CRT, RmeTen, DemographicsLongInternational } from "@watts-lab/surveys";
import Statement from "./Statement";
import MultiStepForm from "./MultiStepForm";
import Result from "./Result";
import { questionData } from "../data/questions";
import useStickyState from "../hooks/useStickyState";
import Backend from "../apis/backend";

import "./style.css";
import ProgressBar from "./ProgressBar";
import { useSession } from "../context/SessionContext";
import ScoreDisplay from "./ScoreDisplay";

export type statementStorageData = {
  id: number;
  answers: string[];
  answereSaved: boolean;
};

function Layout() {
  const [loading, setLoading] = useState(false);
  // get the current language
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const [statementArray, setStatementArray] = useState<ReactNode[]>([]);
  const [statementsData, setStatementsData] = useStickyState<
    statementStorageData[]
  >([], "statementsData");
  const [currentScore, setCurrentScore] = useState({
    commonsense: 0,
    awareness: 0,
    consensus: 0,
  });

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
      <CRT
        key="crt"
        storageName="crt"
        onComplete={onCompleteCallback}
        language={language}
      />,
      <RmeTen
        key="rmet"
        storageName="rmeten"
        onComplete={onCompleteCallback}
        language={language}
      />,
      <DemographicsLongInternational
        key="demographic"
        storageName="demographics"
        onComplete={onCompleteCallback}
        language={language}
      />,
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

  const updateScore = async () => {
    try {
      const response = await Backend.post("/results", { sessionId });
      if (response.data.commonsensicality !== 0) {
        setCurrentScore({
          commonsense: Math.round(
            Number(response.data.commonsensicality.toFixed(2)) * 100
          ),
          awareness: Math.round(
            Number(response.data.awareness.toFixed(2)) * 100
          ),
          consensus: Math.round(
            Number(response.data.consensus.toFixed(2)) * 100
          ),
        });
      }
    } catch (error) {
      console.error("Error fetching updated score:", error);
    }
  };

  const { setCurrentStepIndex, currentStepIndex, back, next } = MultiStepForm({
    steps: statementsData,
    handleAnswerSaving: handleAnswerSaving,
    pushNewStatement: pushNewStatement,
    updateScore,
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
      // Wait a tick to ensure URL params are captured
      await new Promise((resolve) => setTimeout(resolve, 0));

      try {
        setLoading(true);
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
            language: language, // add language parameter
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
      } finally {
        setLoading(false);
      }
    })();
  }, [language, sessionId, urlParams]); // retrieve new statements when language changes

  const submitHandler = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    next();
  };

  return (
    <>
      {loading ? (
        <>
          <ProgressBar currentStep={0} totalSteps={0} />
          <Statement
            statementText={"Loading statement..."}
            statementId={0}
            onChange={() => {}}
            data={{
              answers: ["", "", "", "", "", ""],
            }}
            loading={true}
          />
        </>
      ) : (
        <form id="main-survey" onSubmit={submitHandler}>
          {currentStepIndex !== surveyLength && (
            <ProgressBar
              currentStep={currentStepIndex}
              totalSteps={surveyLength}
            />
          )}
          {statementArray[currentStepIndex]}

          {currentStepIndex < surveyLength - 3 && (
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between">
                <button
                  onClick={back}
                  type="button"
                  className="order-1 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  {(() => {
                    if (currentStepIndex === 0) {
                      return (
                        <Link to="/consent">
                          {/* Start */}
                          {t("layout.start")}
                        </Link>
                      );
                    } else {
                      return t("layout.previous");
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
                      return t("layout.continue");
                    } else {
                      return t("layout.next");
                    }
                  })()}
                </button>
              </div>

              <div className="flex justify-center">
                <ScoreDisplay
                  score={currentScore}
                  currentStepIndex={currentStepIndex}
                />
              </div>
            </div>
          )}
        </form>
      )}
    </>
  );
}

export default Layout;
