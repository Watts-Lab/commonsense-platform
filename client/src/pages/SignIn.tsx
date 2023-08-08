import React, { useState, ChangeEvent, FormEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import Backend from "../apis/backend";

import Header from "../partials/Header";
import NotificationBox from "../utils/NotificationBox";

const SignIn:React.FC = () => {
  const [userEmail, setUserEmail] = useState("");

  const [notifBox, setNotifBox] = useState(false);

  const surveySession = useSelector((state: any) => state.login.surveySession);

  const signIn = async (email: string, magicLink: string = "") => {
    try {
      let res = await Backend.post(`/users/enter`, {
        email,
        magicLink,
        surveySession,
      });
      if (res.data.token) {
        setNotifBox(false);
      } else {
        setNotifBox(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const enterEmail = (e: ChangeEvent<HTMLInputElement>) => {
    setUserEmail(e.target.value);
  };

  const emailSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    signIn(userEmail);
  };

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/*  Site header */}
      <Header where="/" />

      {/*  Page content */}
      <main className="flex-grow">
        <section className="bg-gradient-to-b from-gray-100 to-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="pt-32 pb-12 md:pt-40 md:pb-20">
              {/* Page header */}
              {!notifBox ? (
                <div className="max-w-3xl mx-auto text-center pb-12 md:pb-20">
                  <p className="h4">Welcome back</p>
                  <p>
                    You can check on your common sense score or answer more
                    questions about statements to get a more accurate reading of
                    your score.
                  </p>
                </div>
              ) : null}

              {/* Form */}
              <div className="max-w-sm mx-auto">
                {notifBox ? (
                  <NotificationBox userEmail={userEmail} />
                ) : (
                  <form onSubmit={emailSubmit}>
                    <div className="flex flex-wrap -mx-3 mb-4">
                      <div className="w-full px-3">
                        <label
                          className="block text-gray-800 text-sm font-medium mb-1"
                          htmlFor="email"
                        >
                          Email
                        </label>
                        <input
                          onChange={enterEmail}
                          value={userEmail}
                          id="email"
                          type="email"
                          className="form-input w-full text-gray-800"
                          placeholder="Enter your email address"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap -mx-3 mt-6">
                      <div className="w-full px-3">
                        <button className="btn text-white bg-blue-600 hover:bg-blue-700 w-full">
                          Sign in
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* <Banner /> */}
    </div>
  );
};

export default SignIn;
