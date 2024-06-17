import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../partials/NavBar";
import Footer from "../partials/Footer";
import DashboardChart from "../partials/DashboardChart";
import StatementForm from "../components/StatementForm";
import Backend from "../apis/backend";

import { useAppSelector, useAppDispatch } from "../redux/hooks";
interface Statement {
  statement: string;
}

interface Answer {
  id: number;
  I_agree: boolean;
  I_agree_reason: string;
  others_agree: boolean;
  others_agree_reason: string;
  perceived_commonsense: boolean;
  clarity: string;
  origLanguage: string;
  clientVersion: string;
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  statement_number: number;
  statementId: number;
  statement: Statement;
}

const Dashboard: React.FC = () => {
  const loggedIn = useAppSelector((state) => state.login.loggedIn);

  const [answerList, setAnswerList] = useState<Answer[]>([]);
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  const [editing, setEditing] = useState<boolean>(true);

  const containerRef = useRef();
  const navigate = useNavigate();

  const surveySession = useAppSelector((state) => state.login.surveySession);

  // const token = JSON.parse(localStorage.getItem("token"));
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

  useEffect(() => {
    const getAnswers = async () => {
      if (token === null) return null;
      try {
        Backend.defaults.headers.common["Authorization"] = token;
        const response = await Backend.post("/answers/getanswers", {
          email: "user@test.com",
        });
        setAnswerList(response.data);
        return response.data.ok;
      } catch (error) {
        console.log(error);
      }
    };
    getAnswers();
  }, []);

  function useEditAnswer(
    id: number
  ): React.MouseEventHandler<HTMLAnchorElement> | undefined {
    Backend.defaults.headers.common["Authorization"] = token;
    const response = Backend.post("/answers/changeanswers", {
      i_agree: true,
      others_agree: true,
      statement_number: id,
    })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }

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
                      className={`inline-block p-4 border-b-2 rounded-t-lg ${
                        activeTab === "dashboard"
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
                      className={`inline-block p-4 border-b-2 rounded-t-lg ${
                        activeTab === "profile"
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
                      className={`inline-block p-4 border-b-2 rounded-t-lg ${
                        activeTab === "statement"
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
                      className={`inline-block p-4 border-b-2 rounded-t-lg ${
                        activeTab === "settings"
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
                    className={`p-4 rounded-lg bg-gray-50 dark:bg-gray-800 ${
                      activeTab === "dashboard" ? "block" : "hidden"
                    }`}
                    id="dashboard"
                    role="tabpanel"
                    aria-labelledby="dashboard-tab"
                  >
                    <DashboardChart sessionId={surveySession} />
                  </div>
                  <div
                    className={`p-4 rounded-lg bg-gray-50 dark:bg-gray-800 ${
                      activeTab === "profile" ? "block" : "hidden"
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
                              Is it common sense?
                            </th>
                            <th scope="col" className="px-6 py-3">
                              Others think it is common sense?
                            </th>
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
                                  {answer.I_agree === true ? (
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
                                      className="toggle toggle-sm"
                                      checked
                                    />
                                  )}
                                  {answer.others_agree === true ? (
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
                                  {answer.others_agree === true && (
                                    <a
                                      onClick={useEditAnswer(answer.id)}
                                      className="px-2 inline-flex text-xs leading-5 "
                                    >
                                      Edit
                                    </a>
                                  )}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-lg bg-gray-50 dark:bg-gray-800 ${
                      activeTab === "statement" ? "block" : "hidden"
                    }`}
                    id="statement"
                    role="tabpanel"
                    aria-labelledby="statement-tab"
                  >
                    <StatementForm />
                  </div>

                  <div
                    className={`p-4 rounded-lg bg-gray-50 dark:bg-gray-800 ${
                      activeTab === "settings" ? "block" : "hidden"
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
