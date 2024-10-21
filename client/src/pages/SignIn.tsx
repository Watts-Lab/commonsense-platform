import React, { useState, ChangeEvent, FormEvent } from "react";

import Navbar from "../partials/NavBar";
import NotificationBox from "../utils/NotificationBox";
import Footer from "../partials/Footer";
import { useTranslation } from "react-i18next";
import { useSession } from "../context/SessionContext";

const SignIn: React.FC = () => {
  const {
    actions: { signIn },
  } = useSession();
  const [userEmail, setUserEmail] = useState("");

  const [notifBox, setNotifBox] = useState(false);

  const { t } = useTranslation();

  const enterEmail = (e: ChangeEvent<HTMLInputElement>) => {
    setUserEmail(e.target.value);
  };

  const emailSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    signIn(userEmail).then(() => {
      setNotifBox(true);
    });
  };

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/*  Site header */}
      <Navbar />

      {/*  Page content */}
      <main className="flex-grow bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300">
        <section>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="pt-32 pb-12 md:pt-40 md:pb-20">
              {/* Page header */}
              {!notifBox ? (
                <div className="max-w-3xl mx-auto pb-12 md:pb-20">
                  <p className="h4">{t("signin.welcome")}</p>
                  <p>
                    {/* Sign in so you can check on your common sense score or
                    answer more questions about statements to get a more
                    accurate reading of your score. */}
                    {t("signin.subtitle1")}
                  </p>
                  <p>
                    {/* Or if you don't have an account, you can sign up by entering
                    your email below. */}
                    {t("signin.subtitle2")}
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
                          className="block text-gray-800 dark:text-gray-300 text-sm font-medium mb-1"
                          htmlFor="email"
                        >
                          {t("signin.email")}
                        </label>
                        <input
                          onChange={enterEmail}
                          value={userEmail}
                          id="email"
                          type="email"
                          className="form-input w-full text-gray-800"
                          placeholder={t("signin.placeholder")}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap -mx-3 mt-6">
                      <div className="w-full px-3">
                        <button className="btn text-white bg-gray-600 hover:bg-gray-700 w-full dark:bg-gray-800">
                          {t("signin.signIn")}
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

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default SignIn;
