import React, { useEffect, useState } from "react";

// i18n
import { useTranslation } from "react-i18next";
import useLocalizeDocumentAttributes from "./i18n/useLocalizeDocumentAttributes";

import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useSearchParams,
} from "react-router-dom";

import { useAppSelector, useAppDispatch } from "./redux/hooks";

import {
  setUserData,
  clearUserData,
  setSession,
} from "./redux/slices/loginSlice";

import { setUrlParams } from "./redux/slices/urlSlice";

import "aos/dist/aos.css";
import "./css/style.css";

import AOS from "aos";

// pages
import Home from "./pages/Home";
import About from "./pages/About";
import People from "./pages/People";
import Research from "./pages/Research";
import ConsentPage from "./pages/ConsentPage";
import SurveyPage from "./pages/SurveyPage";
import SignIn from "./pages/SignIn";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import Finish from "./pages/Finish";

// components
import Consent from "./components/Consent";
import Enter from "./components/Enter";
import SocialSurvey from "./components/SocialSurvey";
import HumanNetwork from "./components/HumanNetwork";

// apis
import Backend from "./apis/backend";

// internationalization
//import './i18n';

const App = () => {
  const loggedIn = useAppSelector((state) => state.login.loggedIn);
  const email = useAppSelector((state) => state.login.email);
  const token = useAppSelector((state) => state.login.token);
  const surveySession = useAppSelector((state) => state.login.surveySession);

  const urlParams = useAppSelector((state) => state.urlslice.urlParams);

  const dispatch = useAppDispatch();

  useEffect(() => {
    const verify_token = async () => {
      if (token === null) return dispatch(clearUserData());
      try {
        Backend.defaults.headers.common["Authorization"] = token;
        const response = await Backend.post(`/users/verify`);
        return response.data.ok
          ? dispatch(
              setUserData({
                loggedIn: true,
                email: response.data.email,
                token: token,
                surveySession: response.data.sessionId,
              })
            )
          : dispatch(clearUserData());
      } catch (error) {}
    };
    verify_token();
  }, [token]);

  useEffect(() => {
    // get survey session id
    Backend.get("/", { withCredentials: true }).then((response) => {
      if (!surveySession) {
        dispatch(
          setSession({
            surveySession: response.data,
          })
        );
      }
    });
  }, []);

  const signIn = async (email: string, magicLink: string) => {
    try {
      let res = await Backend.post("/users/enter", {
        email,
        magicLink,
        surveySession,
      });
      if (res.data.token) {
        dispatch(
          setUserData({
            loggedIn: true,
            email: email,
            token: res.data.token,
            surveySession: res.data.sessionId,
          })
        );
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      alert(error);
    }
  };

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  // for removing url params
  const [searchParamsNew, setSearchParamsNew] = useSearchParams();

  useEffect(() => {
    AOS.init({
      once: true,
      disable: "phone",
      duration: 700,
      easing: "ease-out-cubic",
    });
  }, []);

  useEffect(() => {
    // scroll to top on route change
    const htmlElement = document.querySelector("html");
    if (htmlElement) {
      htmlElement.style.scrollBehavior = "auto";
      window.scroll({ top: 0 });
      htmlElement.style.scrollBehavior = "";
    }

    // Get the current URL parameters
    const currentParams = searchParams.entries();
    const URLParams = [...currentParams].map(([key, value]) => ({
      key,
      value,
    }));

    if (location.pathname.startsWith("/s/")) {
      const shareLink = location.pathname.substring(3);
      URLParams.push({ key: "shareLink", value: shareLink });
    }

    // Dispatch the updated parameters
    if (URLParams.length > 0) {
      dispatch(
        setUrlParams({
          urlParams: URLParams,
        })
      );
      setSearchParamsNew("");
    }
  }, [location.pathname]);

  const { t } = useTranslation();
  useLocalizeDocumentAttributes();

  return (
    <div className="App">
      <div className="mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:shareLink" element={<Home />} />
          <Route path="/people" element={<People />} />
          <Route path="/research" element={<Research />} />
          <Route
            path="login/:email/:link"
            element={<Enter signIn={signIn} />}
          />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/survey" element={<ConsentPage />} />
          <Route path="/consent" element={<Consent />} />
          <Route path="/statements" element={<SurveyPage />} />
          <Route path="/finish" element={<Finish />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/dashboard" element={<Dashboard />} />

          <Route
            path="/social"
            element={<SocialSurvey statementText={"hey hey"} />}
          />
        </Routes>
      </div>
    </div>
  );
};

export default App;
