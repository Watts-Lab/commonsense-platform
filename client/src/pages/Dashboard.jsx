import React, { useState, useEffect } from "react";

import Header from "../partials/Header";
import Footer from "../partials/Footer";

import Backend from "../apis/backend";

function Dashboard(props) {
  const [answerList, setAnswerList] = useState([]);

  const token = JSON.parse(localStorage.getItem("token"));

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
              <h1 className="text-xl pb-4">Dashboard</h1>

              <p className="pb-2">You have answered {answerList.length} statements so far.</p>

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
          </div>
        </section>
      </main>

      {/* <Banner /> */}
    </div>
  );
}

export default Dashboard;
