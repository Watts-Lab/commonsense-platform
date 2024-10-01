import React, { useState, ChangeEvent, FormEvent } from "react";
import Navbar from "../partials/NavBar";
import Footer from "../partials/Footer";
import Backend from "../apis/backend";
import NotificationBox from "../utils/NotificationBox";
import NotificationBoxEmail from "../utils/NotificationBoxEmail";

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
        <div className="text-center p-6">
          <h1 className="text-2xl font-bold mb-4">
            Down for maintenance, if you want to be notified when we are up
            again, please leave your email address.
          </h1>

          <div className="max-w-sm mx-auto">
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
        </div>
      </main>
      {/* Site footer */}
      <Footer />
    </div>
  );
};

export default HomeTemp;
