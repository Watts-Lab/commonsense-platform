import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../partials/NavBar";
import Footer from "../partials/Footer";
import DashboardChart from "../partials/DashboardChart";
import StatementForm from "../components/StatementForm";
import Backend from "../apis/backend";

import { useSession } from "../context/SessionContext";
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
  const { t } = useTranslation();
  const {
    state: { user, sessionId },
    actions: { setUser },
  } = useSession();
  const [answerList, setAnswerList] = useState<Answer[]>([]);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [editing, setEditing] = useState<boolean>(false);
  const [othersAgreeCheckboxStates, setOthersAgreeCheckboxStates] = useState<{
    [key: number]: boolean;
  }>({});
  const [agreeCheckboxStates, setAgreeCheckboxStates] = useState<{
    [key: number]: boolean;
  }>({});

  const navigate = useNavigate();
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

  const signOut = () => {
    setUser(null);
    navigate("/");
  };

  useEffect(() => {
    if (!user) {
      navigate("/signin");
    }
  }, [user]);

  const getAnswers = async () => {
    if (token === null) return;
    try {
      Backend.defaults.headers.common["Authorization"] = token;
      const response = await Backend.post("/answers/getanswers", {
        email: "user@test.com",
      });
      if (!Array.isArray(response.data)) {
        console.error("Expected an array but got:", response.data);
        return;
      }

      const updatedAnswers = response.data;
      const statementIds = updatedAnswers.map((answer) => answer.statementId);
      const agreementResponse = await Backend.post(
        "/results/agreementPercentage",
        { statementIds }
      );
      const agreementPercentages = agreementResponse.data;

      const initialCheckboxStates = updatedAnswers.reduce((acc, answer) => {
        acc[answer.id] = answer.others_agree;
        return acc;
      }, {});
      setOthersAgreeCheckboxStates(initialCheckboxStates);

      const initialAgreeCheckboxStates = updatedAnswers.reduce(
        (acc, answer) => {
          acc[answer.id] = answer.I_agree;
          return acc;
        },
        {}
      );
      setAgreeCheckboxStates(initialAgreeCheckboxStates);

      const updatedAnswerList = updatedAnswers.map((answer) => ({
        ...answer,
        agreement: agreementPercentages[answer.statementId] || {
          I_agree: 0,
          others_agree: 0,
        },
      }));
      setAnswerList(updatedAnswerList);
    } catch (error) {
      console.log("Error fetching answers:", error);
    }
  };

  useEffect(() => {
    getAnswers();
  }, []);

  //  Change I_agree or others_agree variable -- Usage:
  // For I_agree: handleCheckboxChange(id, 'I_agree')
  // For others_agree: handleCheckboxChange(id, 'others_agree')
  const handleCheckboxChange = async (
    id: number,
    type: "I_agree" | "others_agree"
  ) => {
    const stateKey =
      type === "I_agree" ? "agreeCheckboxStates" : "othersAgreeCheckboxStates";
    const setState =
      type === "I_agree"
        ? setAgreeCheckboxStates
        : setOthersAgreeCheckboxStates;
    const newCheckedState = !(
      type === "I_agree" ? agreeCheckboxStates : othersAgreeCheckboxStates
    )[id];
    const currentAnswer = answerList.find((answer) => answer.id === id);

    if (!currentAnswer) {
      console.error("Answer not found");
      return;
    }

    setState((prevStates) => ({
      ...prevStates,
      [id]: newCheckedState,
    }));

    try {
      Backend.defaults.headers.common["Authorization"] = token;
      const response = await Backend.post("/answers/changeanswers", {
        statementId: currentAnswer.statementId,
        I_agree:
          type === "I_agree"
            ? newCheckedState
              ? 1
              : 0
            : currentAnswer.I_agree
            ? 1
            : 0,
        I_agree_reason: "n/a - answer changed",
        others_agree:
          type === "others_agree"
            ? newCheckedState
              ? 1
              : 0
            : currentAnswer.others_agree
            ? 1
            : 0,
        others_agree_reason: "n/a - answer changed",
        perceived_commonsense: 0,
        sessionId: sessionId,
      });
      console.log(`${type} updated`, response.data);
      if (type == "I_agree") {
        currentAnswer.I_agree = newCheckedState;
      } else {
        currentAnswer.others_agree = newCheckedState;
      }
    } catch (error) {
      console.error(`Error updating ${type}`, error);
      // Revert the state change in case of an error
      setState((prevStates) => ({
        ...prevStates,
        [id]: !newCheckedState,
      }));
    }
  };

  const useEditAnswer = async () => {
    if (editing) {
      if (!token) return;

      try {
        await getAnswers(); // call getAnswers to refresh the data and get new percentage
      } catch (error) {
        console.log("Error refreshing data in useEditAnswer:", error);
      }
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
                      {/* Insight */}
                      {t("dashboard.insight")}
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
                      {/* Answers */}
                      {t("dashboard.answers")}
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
                      {/* Add statements */}
                      {t("dashboard.add-statements")}
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
                      {/* Settings */}
                      {t("dashboard.settings")}
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
                    <DashboardChart />
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
                          {/* Your answers */}
                          {t("dashboard.your-answers")}
                          <p className="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                            {/* Browse the list of statements you have answered so
                            far */}
                            {t("dashboard.browse-list")}
                          </p>
                        </caption>
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                          <tr>
                            <th scope="col" className="px-6 py-3">
                              {/* Statement */}
                              {t("dashboard.statement")}
                            </th>
                            <th scope="col" className="px-6 py-3">
                              {t("dashboard.i-agree")}
                            </th>
                            <th scope="col" className="px-6 py-3">
                              {t("dashboard.others-agree")}
                            </th>
                            <th scope="col" className="px-6 py-3">
                              {t("dashboard.your-accuracy")}
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
                                      onChange={() =>
                                        handleCheckboxChange(
                                          answer.id,
                                          "I_agree"
                                        )
                                      }
                                    />
                                  )}
                                  {agreeCheckboxStates[answer.id] ? (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                      {/* Yes */}
                                      {t("dashboard.yes")}
                                    </span>
                                  ) : (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                      {/* No */}
                                      {t("dashboard.no")}
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  {editing && (
                                    <input
                                      type="checkbox"
                                      className="toggle toggle-sm mr-3 align-middle relative"
                                      checked={
                                        othersAgreeCheckboxStates[answer.id]
                                      }
                                      onChange={() =>
                                        handleCheckboxChange(
                                          answer.id,
                                          "others_agree"
                                        )
                                      }
                                    />
                                  )}
                                  {othersAgreeCheckboxStates[answer.id] ? (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                      {/* Yes */}
                                      {t("dashboard.yes")}
                                    </span>
                                  ) : (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                      {/* No */}
                                      {t("dashboard.no")}
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  {answer.agreement
                                    ? answer.others_agree
                                      ? `${answer.agreement.others_agree.toFixed(
                                          0
                                        )}%`
                                      : `${(
                                          100 - answer.agreement.others_agree
                                        ).toFixed(0)}%`
                                    : "N/A"}
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
                    <div className="mb-4">
                      <button
                        onClick={deleteAccount}
                        className="bg-white text-black font-bold py-2 px-4 rounded shadow transition duration-300 ease-in-out hover:shadow-lg"
                      >
                        {/* Delete account */}
                        {t("dashboard.delete-account")}
                      </button>
                    </div>
                    <div>
                      <button
                        onClick={signOut}
                        className="bg-white text-black font-bold py-2 px-4 rounded shadow transition duration-300 ease-in-out hover:shadow-lg"
                      >
                        {/* Sign out*/}
                        {t("dashboard.signout")}
                      </button>
                    </div>
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
