import React, { useState, ChangeEvent, FormEvent } from "react";
import Navbar from "../partials/NavBar";
import Footer from "../partials/Footer";
import Backend from "../apis/backend";
import NotificationBox from "../utils/NotificationBox";
import NotificationBoxEmail from "../utils/NotificationBoxEmail";
import Banner from "../partials/Banner";
import { t } from "i18next";
import commonsenseLogo from "../images/Light-mode.svg";

const HomeTemp: React.FC = () => {
  const [userEmail, setUserEmail] = useState("");
  const [notifBox, setNotifBox] = useState(false);

  const signIn = async (email: string) => {
    try {
      let res = await Backend.post(`/users/enter`, {
        email,
      });
      if (res.data.token) {
        setNotifBox(false);
        // You can handle successful sign-in logic here
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
      {/* Site header */}
      <Navbar />
      {/* Page content */}
      <main className="flex flex-grow items-center justify-center bg-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Hero content */}
          <div className="pt-20 pb-12 md:pt-20 md:pb-40">
            {/* Section header */}
            <div className="pb-10 md:pb-16">
              <div className="max-w-3xl mx-auto px-10">
                <h1 className="text-2xl font-bold mb-4">
                  Down for maintenance, if you want to be notified when we are
                  up again, please leave your email address.
                </h1>

                <div className="max-w-sm mx-auto mb-10">
                  {notifBox ? (
                    <NotificationBoxEmail userEmail={userEmail} />
                  ) : (
                    <form onSubmit={emailSubmit}>
                      <div className="flex flex-wrap -mx-3 mb-4">
                        <div className="w-full px-3">
                          <label
                            className="block text-gray-800 dark:text-gray-300 text-sm font-medium mb-1"
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
                            placeholder="Enter your email"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap -mx-3 mt-6">
                        <div className="w-full px-3">
                          <button className="btn text-white bg-gray-600 hover:bg-gray-700 w-full dark:bg-gray-800">
                            Submit
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>

                <img
                  className="mx-auto mb-6"
                  src={commonsenseLogo}
                  alt={t("banner.logo")}
                />
                <h1 className="text-3xl md:text-4xl font-bold leading-tighter tracking-tight mb-4">
                  {/* How common is common sense really? */}
                  {t("banner.title")}
                </h1>

                <p className="text-md my-8">
                  {/* Common sense is often defined as “what all sensible people know,” 
                  but this definition is circular: how do we know someone is sensible 
                  other than that they possess common sense? As a result, most people 
                  believe that they themselves possess common sense, but can't articulate 
                  which of their beliefs are commonsensical or how common their beliefs are 
                  to others. */}
                  {t("banner.paragraph1")}
                </p>
                <p className="text-md my-8">
                  {/* This project seeks to quantify common sense empirically via a massive online 
                  survey experiment. Participants will read a series of \"claims\" about the physical 
                  and social world (e.g. \"Dropped pebbles fall to the ground\" or \"Fully automatic 
                  assault rifles should be banned\"), state whether they agree with each claim, and 
                  also state what they think most other people think. */}
                  {t("banner.paragraph2")}
                </p>
                <p className="text-md my-8">
                  {/* We have developed novel methods to extract statements from several diverse 
                  sources including appearances in mass media, non-fiction books, and political 
                  campaign emails, as well as statements elicited from human respondents and 
                  generated by AI systems. Our findings will shed light on the nature and limits 
                  of common sense, thereby aiding research communities (e.g. AI and ML) who wish 
                  to explore and simulate this ubiquitous yet frustratingly elusive concept. */}
                  {t("banner.paragraph3")}
                </p>
                <p className="text-md my-8">
                  {/* For more detail into this work, see our recent paper */}
                  {t("banner.paragraph4-1")}{" "}
                  <a
                    className="text-blue-800 dark:text-blue-300"
                    href="https://doi.org/10.1073/pnas.2309535121"
                  >
                    {/* A framework for quantifying individual and collective common sense */}
                    {t("banner.paper")}
                  </a>
                  {/* , published */}
                  {t("banner.paragraph4-2")}{" "}
                  <span className="italic">
                    {/* in The Proceedings of the National Academy of Sciences. */}
                    {t("banner.paragraph4-3")}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center p-6"></div>
      </main>
      {/* Site footer */}
      <Footer />
    </div>
  );
};

export default HomeTemp;
