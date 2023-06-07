import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import "aos/dist/aos.css";
import "./css/style.css";

import AOS from "aos";

// pages
import Home from "./pages/Home";
import ConsentPage from "./pages/ConsentPage";
import SurveyPage from "./pages/SurveyPage";
import SignIn from "./pages/SignIn";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";

// components
import Consent from "./components/Consent";
import Landing from "./components/Landing";
import Result from "./components/Result";
import Enter from "./components/Enter";

import Backend from "./apis/backend";

import Cookies from "universal-cookie";

const cookies = new Cookies();

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // Dealing with the token
  const token = JSON.parse(localStorage.getItem("token"));

  useEffect(() => {
    const verify_token = async () => {
      if (token === null) return setLoggedIn(false);
      try {
        Backend.defaults.headers.common["Authorization"] = token;
        const response = await Backend.post(`/users/verify`);
        setUserEmail(response.data.succ.email);
        return response.data.ok ? login(token) : logout();
      } catch (error) {
        console.log(error);
      }
    };
    verify_token();
  }, []);

  const login = (token) => {
    localStorage.setItem("token", JSON.stringify(token));
    setLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUserEmail("");
    setLoggedIn(false);
  };

  const signIn = async (email, magicLink) => {
    try {
      let res = await Backend.post("/users/enter", { email, magicLink });
      if (res.data.token) {
        alert(res.data.message);
        login(res.data.token);
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      alert(error);
    }
  };

  const location = useLocation();

  useEffect(() => {
    AOS.init({
      once: true,
      disable: "phone",
      duration: 700,
      easing: "ease-out-cubic",
    });
  });

  useEffect(() => {
    document.querySelector("html").style.scrollBehavior = "auto";
    window.scroll({ top: 0 });
    document.querySelector("html").style.scrollBehavior = "";
  }, [location.pathname]); // triggered on route change

  return (
    <div className="App">
      <div className="mx-auto pb-14">
        <Routes>
          <Route
            exact
            path="/"
            element={<Home loggedIn={loggedIn} user={userEmail} />}
          />
          <Route
            path="login/:email/:link"
            element={<Enter signIn={signIn} />}
          />
          <Route
            path="/signin"
            element={<SignIn loggedIn={loggedIn} user={userEmail} />}
          />
          <Route path="/survey" element={<ConsentPage />} />
          <Route path="/consent" element={<Consent />} />
          <Route path="/statements" element={<SurveyPage />} />
          <Route path="/finish" element={<Result />} />
          <Route
            path="/welcome"
            element={<Welcome loggedIn={loggedIn} user={userEmail} />}
          />
          <Route
            path="/dashboard"
            element={<Dashboard loggedIn={loggedIn} user={userEmail} />}
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
