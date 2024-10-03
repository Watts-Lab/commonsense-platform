import { useEffect } from "react";

// i18n
import { useTranslation } from "react-i18next";
import useLocalizeDocumentAttributes from "./i18n/useLocalizeDocumentAttributes";

import { Routes, Route } from "react-router-dom";

import "aos/dist/aos.css";
import "./css/style.css";

import AOS from "aos";

// pages
import Home from "./pages/Home";
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

const App = () => {
  useEffect(() => {
    AOS.init({
      once: true,
      disable: "phone",
      duration: 700,
      easing: "ease-out-cubic",
    });
  }, []);

  useLocalizeDocumentAttributes();

  return (
    <div className="App">
      <div className="mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:shareLink" element={<Home />} />
          <Route path="/people" element={<People />} />
          <Route path="/research" element={<Research />} />
          <Route path="login/:email/:link" element={<Enter />} />
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
