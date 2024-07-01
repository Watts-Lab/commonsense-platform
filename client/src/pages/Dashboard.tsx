import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../partials/NavBar";
import Footer from "../partials/Footer";
import DashboardChart from "../partials/DashboardChart";
import StatementForm from "../components/StatementForm";
import Backend from "../apis/backend";

import { useAppSelector } from "../redux/hooks";
interface Statement {
  statement: string;
}

type Agreement = {
  I_agree: number;
  others_agree: number;
};

interface Answer {
  id: number;
  I_agree: boolean;
  I_agree_reason: string;
  others_agree: boolean;
  others_agree_reason: string;
  perceived_commonsense: boolean;
  commonsensicality?: number;
  clarity: string;
  origLanguage: string;
  clientVersion: string;
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  statement_number: number;
  statementId: number;
  statement: Statement;
  agreement?: Agreement;
}

const Dashboard: React.FC = () => {
  const loggedIn = useAppSelector((state) => state.login.loggedIn);

  const [answerList, setAnswerList] = useState<Answer[]>([]);
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  const [editing, setEditing] = useState<boolean>(false);
  const [checkboxStates, setCheckboxStates] = useState<{ [key: number]: boolean }>({});
  const [agreeCheckboxStates, setAgreeCheckboxStates] = useState<{ [key: number]: boolean }>({});

  const containerRef = useRef();
  const navigate = useNavigate();

  const surveySession = useAppSelector((state) => state.login.surveySession);

  const tokenString = localStorage.getItem("token");
  const token = tokenString !== null ? JSON.parse(tokenString) : null;

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  const deleteAccount = async () => {
    try {
      Backend.defaults.headers.common["Authorization"] = token;
      const response = await Backend.post("/users/deleteaccount", {
        email: "",
      });
      return response.data.ok;
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!loggedIn) {
      navigate("/signin");
    }
  }, [loggedIn, navigate]);

  const getAnswers = async () => {
    if (token === null) return;
    try {
      Backend.defaults.headers.common["Authorization"] = token;
      const response = await Backend.post("/answers/getanswers", {
        email: "user@test.com",
      });

      console.log("Response from getanswers:", response.data);

      if (!Array.isArray(response.data)) {
        console.error("Expected an array but got:", response.data);
        return;
      }

      const updatedAnswers = response.data;

      const statementIds = updatedAnswers.map(answer => answer.statementId);
      const commonsensicalityResponse = await Backend.post("/results/commonsensicality", { statementIds });
      const commonsensicalityScores = commonsensicalityResponse.data;

      const agreementResponse = await Backend.post("/results/agreementPercentage", { statementIds });
      const agreementPercentages = agreementResponse.data;

      const initialCheckboxStates = updatedAnswers.reduce((acc, answer) => {
        acc[answer.id] = answer.others_agree;
        return acc;
      }, {});
      setCheckboxStates(initialCheckboxStates);

      const initialAgreeCheckboxStates = updatedAnswers.reduce((acc, answer) => {
        acc[answer.id] = answer.I_agree;
        return acc;
      }, {});
      setAgreeCheckboxStates(initialAgreeCheckboxStates);

      const updatedAnswerList = updatedAnswers.map(answer => ({
        ...answer,
        commonsensicality: commonsensicalityScores[answer.statementId] || 0,
        agreement: agreementPercentages[answer.statementId] || { I_agree: 0, others_agree: 0 },
      }));
      setAnswerList(updatedAnswerList);

    } catch (error) {
      console.log("Error fetching answers:", error);
    }
  };

  useEffect(() => {
    getAnswers();
  }, []);

  //OTHERS THINK IT IS COMMON SENSE? change others_agree variable
  const handleCheckboxChange = async (id: number) => {
    const newCheckedState = !checkboxStates[id];
    const currentAnswer = answerList.find(answer => answer.id === id);

    // Check if currentAnswer is undefined
    if (!currentAnswer) {
      console.error("Answer not found");
      return;
    }

    setCheckboxStates((prevStates) => ({
      ...prevStates,
      [id]: newCheckedState,
    }));

    try {
      Backend.defaults.headers.common["Authorization"] = token;
      const response = await Backend.post("/answers/changeanswers", {
        statementId: id,
        others_agree: newCheckedState ? 1 : 0,
        I_agree: currentAnswer.I_agree ? 1 : 0,
      });
      console.log("Answer updated");
      return response.data.ok;
    } catch (error) {
      console.log(error);
      // Revert the state change in case of an error
      setCheckboxStates((prevStates) => ({
        ...prevStates,
        [id]: !newCheckedState,
      }));
    }
  };


  //change I_agree variable
  const handleAgreeCheckboxChange = async (id: number) => {
    const newCheckedState = !agreeCheckboxStates[id];
    const currentAnswer = answerList.find(answer => answer.id === id);

    // Check if currentAnswer is undefined
    if (!currentAnswer) {
      console.error("Answer not found");
      return;
    }

    setAgreeCheckboxStates((prevStates) => ({
      ...prevStates,
      [id]: newCheckedState,
    }));

    try {
      Backend.defaults.headers.common["Authorization"] = token;
      const response = await Backend.post("/answers/changeanswers", {
        statementId: id,
        others_agree: currentAnswer.others_agree ? 1 : 0,
        I_agree: newCheckedState ? 1 : 0,
      });
      console.log("Answer updated", response.data);
    } catch (error) {
      console.log("Error updating answer", error);
      // Revert the state change in case of an error
      setAgreeCheckboxStates((prevStates) => ({
        ...prevStates,
        [id]: !newCheckedState,
      }));
    }
  };
  const useEditAnswer = async () => {
    if (editing) {
      if (!token) return;

      const saveChanges = async () => {
        const promises = Object.keys(checkboxStates).map(async (id) => {
          const currentAnswer = answerList.find(answer => answer.id === parseInt(id));
          if (!currentAnswer) return;

          try {
            Backend.defaults.headers.common["Authorization"] = token;
            const response = await Backend.post("/answers/changeanswers", {
              statementId: parseInt(id),
              others_agree: checkboxStates[id] ? 1 : 0,
              I_agree: agreeCheckboxStates[id] ? 1 : 0,
            });
            console.log("Answer updated");

            // Update local state based on response
            setCheckboxStates((prevStates) => ({
              ...prevStates,
              [id]: checkboxStates[id]
            }));
            setAgreeCheckboxStates((prevStates) => ({
              ...prevStates,
              [id]: agreeCheckboxStates[id]
            }));
          } catch (error) {
            console.log("Error updating answer", error);
          }
        });
        await Promise.all(promises);
      };

      await saveChanges();
    }

    setEditing(!editing);
  };


  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/*  Site header */}
      <Navbar />

      {/*  Page content */}
      <main className="flex-grow">
        <section className="bg-gray-200 dark:bg-gray-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="pt-12 pb-12 md:pt-12 md:pb-20">
              <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
                <ul
                  className="flex flex-wrap -mb-px text-sm font-medium text-center"
                  role="tablist"
                >
                  <li className="mr-2" role="presentation">
                    <button
                      className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === "dashboard"
                        ? "border-brand-500"
                        : "border-transparent"
                        } hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300`}
                      onClick={() => handleTabClick("dashboard")}
                      role="tab"
                      aria-controls="dashboard"
                      aria-selected={activeTab === "dashboard"}
                    >
                      Insight
                    </button>
                  </li>
                  <li className="mr-2" role="presentation">
                    <button
                      className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === "profile"
                        ? "border-brand-500"
                        : "border-transparent"
                        }`}
                      onClick={() => handleTabClick("profile")}
                      role="tab"
                      aria-controls="profile"
                      aria-selected={activeTab === "profile"}
                    >
                      Answers
                    </button>
                  </li>

                  <li className="mr-2" role="presentation">
                    <button
                      className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === "statement"
                        ? "border-brand-500"
                        : "border-transparent"
                        }`}
                      onClick={() => handleTabClick("statement")}
                      role="tab"
                      aria-controls="statement"
                      aria-selected={activeTab === "statement"}
                    >
                      Add statements
                    </button>
                  </li>

                  <li className="mr-2" role="presentation">
                    <button
                      className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === "settings"
                        ? "border-brand-500"
                        : "border-transparent"
                        } hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300`}
                      onClick={() => handleTabClick("settings")}
                      role="tab"
                      aria-controls="settings"
                      aria-selected={activeTab === "settings"}
                    >
                      Settings
                    </button>
                  </li>
                </ul>
                <div id="myTabContent">
                  <div
                    className={`p-4 rounded-lg bg-gray-50 dark:bg-gray-800 ${activeTab === "dashboard" ? "block" : "hidden"
                      }`}
                    id="dashboard"
                    role="tabpanel"
                    aria-labelledby="dashboard-tab"
                  >
                    <DashboardChart sessionId={surveySession} />
                  </div>
                  <div
                    className={`p-4 rounded-lg bg-gray-50 dark:bg-gray-800 ${activeTab === "profile" ? "block" : "hidden"
                      }`}
                    id="profile"
                    role="tabpanel"
                    aria-labelledby="profile-tab"
                  >
                    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <caption className="p-5 text-lg font-semibold text-left text-gray-900 bg-white dark:text-white dark:bg-gray-800">
                          Your answers
                          <p className="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                            Browse the list of statements you have answered so
                            far
                          </p>
                        </caption>
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                          <tr>
                            <th scope="col" className="px-6 py-3">
                              Statement
                            </th>
                            <th scope="col" className="px-6 py-3">
                              I agree with this statement
                            </th>
                            <th scope="col" className="px-6 py-3">
                              I think most others agree
                            </th>
                            <th scope="col" className="px-6 py-3">
                              People who think what you think most people think
                            </th>
                            <tr>
                              <th className="px-6 py-3 text-right">
                                <button
                                  onClick={useEditAnswer}
                                  className="px-2 py-2 text-white bg-[#2d374a] hover:bg-[#1a202c] rounded-md w-[90px] h-[50px] text-center shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                                >
                                  {editing ? "Done" : "Edit your Answers"}
                                </button>
                              </th>
                            </tr>
                          </tr>
                        </thead>
                        <tbody>
                          {answerList.length > 0 &&
                            answerList.map((answer, index) => (
                              <tr
                                key={index}
                                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                              >
                                <td
                                  scope="row"
                                  className="min-w-[18rem] max-w-[60rem] px-6 py-4 font-medium text-gray-900 whitespace-normal dark:text-white"
                                >
                                  {answer.statement.statement}
                                </td>
                                <td className="px-6 py-4">
                                  {editing && (
                                    <input
                                      type="checkbox"
                                      className="toggle toggle-sm mr-3 align-middle relative"
                                      checked={agreeCheckboxStates[answer.id]}
                                      onChange={() => handleAgreeCheckboxChange(answer.id)}
                                    />
                                  )}
                                  {agreeCheckboxStates[answer.id] ? (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                      Yes
                                    </span>
                                  ) : (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                      No
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  {editing && (
                                    <input
                                      type="checkbox"
                                      className="toggle toggle-sm mr-3 align-middle relative"
                                      checked={checkboxStates[answer.id]}
                                      onChange={() => handleCheckboxChange(answer.id)}
                                    />
                                  )}
                                  {checkboxStates[answer.id] ? (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                      Yes
                                    </span>
                                  ) : (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                      No
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  {answer.agreement ?
                                    `${((answer.agreement.others_agree) / 2).toFixed(0)}%`
                                    :
                                    "N/A"
                                  }
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-lg bg-gray-50 dark:bg-gray-800 ${activeTab === "statement" ? "block" : "hidden"
                      }`}
                    id="statement"
                    role="tabpanel"
                    aria-labelledby="statement-tab"
                  >
                    <StatementForm />
                  </div>

                  <div
                    className={`p-4 rounded-lg bg-gray-50 dark:bg-gray-800 ${activeTab === "settings" ? "block" : "hidden"
                      }`}
                    id="settings"
                    role="tabpanel"
                    aria-labelledby="settings-tab"
                  >
                    <button onClick={deleteAccount}>Delete account</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
