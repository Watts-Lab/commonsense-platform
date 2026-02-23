import { useEffect } from "react";

// i18n
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
import Demo from "./pages/Demo";
import GDPRNotice from "./components/GDPRNotice";
import Privacy from "./pages/Privacy";
import UrlParamCapture from "./components/UrlParamCapture";
import { Toaster } from "sonner";

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
        <UrlParamCapture />
        <Toaster position="bottom-right" richColors />


        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/s/:shareLink" element={<Home />} />
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
          <Route path="/demo" element={<Demo />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
        <GDPRNotice />
      </div>
    </div>
  );
};

export default App;
