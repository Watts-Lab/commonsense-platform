import React, { useState, useEffect } from "react";

import Header from "../partials/Header";
import Footer from "../partials/Footer";

import Backend from "../apis/backend";

function Dashboard(props) {
  const [answerList, setAnswerList] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");

  const token = JSON.parse(localStorage.getItem("token"));

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  const deleteAccount = async () => {
    try {
      Backend.defaults.headers.common["Authorization"] = token;
      const response = await Backend.post("/users/deleteaccount", {
        email: ""
      });
      return response.data.ok;
    } catch (error) {
      console.log(error);
    }
  };

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

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/*  Site header */}
      <Header loggedIn={props.loggedIn} user={props.user} where="/" />

      {/*  Page content */}
      <main className="flex-grow">
        <section className="bg-gradient-to-b from-gray-100 to-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="pt-32 pb-12 md:pt-40 md:pb-20">
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
                      Dashboard
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
                      Profile
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
                    <p className="pb-2">
                      You have answered {answerList.length} statements so far.
                    </p>
                    <ol className="space-y-4 text-gray-500 list-decimal list-inside dark:text-gray-400">
                      {answerList.map((answer, index) => (
                        <li key={index}>
                          {answer.statement.statement}
                          <ul className="pl-5 mt-2 space-y-1 list-disc list-inside">
                            <li>
                              Is it common sense:{" "}
                              {answer.questionOneAgree === 1 ? (
                                <span className="text-green-800">Yes</span>
                              ) : (
                                <span className="text-red-700">No</span>
                              )}
                            </li>
                            <li>
                              Others think it is common sense:{" "}
                              {answer.questionThreeAgree === 1 ? (
                                <span className="text-green-800">Yes</span>
                              ) : (
                                <span className="text-red-700">No</span>
                              )}
                            </li>
                          </ul>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div
                    className={`p-4 rounded-lg bg-gray-50 dark:bg-gray-800 ${
                      activeTab === "profile" ? "block" : "hidden"
                    }`}
                    id="profile"
                    role="tabpanel"
                    aria-labelledby="profile-tab"
                  >
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      This is some placeholder content the Profile tab's.
                      Clicking another tab will toggle the visibility of this
                      one for the next. The tab JavaScript swaps classes to
                      control the content visibility and styling.
                    </p>
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

      {/* <Banner /> */}
    </div>
  );
}

export default Dashboard;
