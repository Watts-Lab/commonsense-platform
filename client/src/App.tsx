import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
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
import ConsentPage from "./pages/ConsentPage";
import SurveyPage from "./pages/SurveyPage";
import SignIn from "./pages/SignIn";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import Finish from "./pages/Finish";

// components
import Consent from "./components/Consent";
import Enter from "./components/Enter";

// apis
import Backend from "./apis/backend";

function App(): JSX.Element {
  const loggedIn = useSelector((state: any) => state.login.loggedIn);
  const email = useSelector((state: any) => state.login.email);
  const token = useSelector((state: any) => state.login.token);
  const surveySession = useSelector((state: any) => state.login.surveySession);

  const urlParams = useSelector((state: any) => state.urlslice.urlParams);

  const dispatch = useDispatch();

  useEffect(() => {
    const verify_token = async () => {
      if (token === null) return dispatch(clearUserData(null));
      try {
        Backend.defaults.headers.common["Authorization"] = token;
        const response = await Backend.post(`/users/verify`);
        console.log(response);
        return response.data.ok
          ? dispatch(
              setUserData({
                loggedIn: true,
                email: response.data.email,
                token: token,
                surveySession: response.data.sessionId,
              })
            )
          : dispatch(clearUserData(null));
      } catch (error) {
        console.log(error);
      }
    };
    verify_token();
  }, [token, dispatch]);

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
  }, [dispatch, surveySession]);

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

    // get url params
    let paramString: { key: string; value: string }[] = [];

    for (const [key, value] of searchParams.entries()) {
      paramString.push({ key, value });
    }

    // save url params in redux store
    if (paramString.length > 0) {
      dispatch(
        setUrlParams({
          urlParams: paramString,
        })
      );
      setSearchParamsNew("");
    }
  }, [location.pathname, dispatch, searchParams, setSearchParamsNew]);

  return (
    <div className="App">
      <div className="mx-auto pb-14">
        <Routes>
          <Route path="/" element={<Home />} />
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
        </Routes>
      </div>
    </div>
  );
}

export default App;
