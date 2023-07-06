import { createSlice } from "@reduxjs/toolkit";

const loggedIn =
  localStorage.getItem("loggedIn") !== null
    ? JSON.parse(localStorage.getItem("loggedIn"))
    : false;

const email =
  localStorage.getItem("email") !== null
    ? JSON.parse(localStorage.getItem("email"))
    : "";

const token =
  localStorage.getItem("token") !== null
    ? JSON.parse(localStorage.getItem("token"))
    : "";

const surveySession =
  localStorage.getItem("surveySession") !== null
    ? JSON.parse(localStorage.getItem("surveySession"))
    : "";

const setLoginFunction = (loggedIn, email, token, surveySession) => {
  localStorage.setItem("loggedIn", JSON.stringify(loggedIn));
  localStorage.setItem("email", JSON.stringify(email));
  localStorage.setItem("token", JSON.stringify(token));
  localStorage.setItem("surveySession", JSON.stringify(surveySession));
};

const setSessionFunction = (surveySession) => {
  localStorage.setItem("surveySession", JSON.stringify(surveySession));
};

const initialState = {
  loggedIn: loggedIn,
  email: email,
  token: token,
  surveySession: surveySession,
};

export const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.loggedIn = action.payload.loggedIn;
      state.email = action.payload.email;
      state.token = action.payload.token;
      state.surveySession = action.payload.surveySession;
      setLoginFunction(
        action.payload.loggedIn,
        action.payload.email,
        action.payload.token,
        action.payload.surveySession
      );
    },
    clearUserData: (state, action) => {
      state.loggedIn = false;
      state.email = "";
      state.token = "";
      state.surveySession = "";
      setLoginFunction(false, "", "", "");
    },
    setSession: (state, action) => {
      state.surveySession = action.payload.surveySession;
      setSessionFunction(action.payload.surveySession);
    }

  },
});

export const { setUserData, clearUserData, setSession } = loginSlice.actions;

export default loginSlice.reducer;
