import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const loggedIn = localStorage.getItem("loggedIn");
const parsedLoggedIn = loggedIn !== null ? JSON.parse(loggedIn) : false;

const email = localStorage.getItem("email");
const parsedEmail = email !== null ? JSON.parse(email) : "";

const token = localStorage.getItem("token");
const parsedToken = token !== null ? JSON.parse(token) : "";

const surveySession = localStorage.getItem("surveySessionId");
const parsedSurveySession = surveySession !== null ? JSON.parse(surveySession) : "";

const setLoginFunction = (
  loggedIn: boolean,
  email: string,
  token: string,
  surveySession: string
) => {
  localStorage.setItem("loggedIn", JSON.stringify(loggedIn));
  localStorage.setItem("email", JSON.stringify(email));
  localStorage.setItem("token", JSON.stringify(token));
  localStorage.setItem("surveySessionId", JSON.stringify(surveySession));
};

const setSessionFunction = (surveySession: string) => {
  localStorage.setItem("surveySessionId", JSON.stringify(surveySession));
};

interface LoginState {
  loggedIn: boolean;
  email: string;
  token: string;
  surveySession: string;
}

const initialState: LoginState = {
  loggedIn: parsedLoggedIn,
  email: parsedEmail,
  token: parsedToken,
  surveySession: parsedSurveySession,
};


export const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<LoginState>) => {
      const { loggedIn, email, token, surveySession } = action.payload;
      state.loggedIn = loggedIn;
      state.email = email;
      state.token = token;
      state.surveySession = surveySession;
      setLoginFunction(loggedIn, email, token, surveySession);
    },
    clearUserData: (state) => {
      state.loggedIn = false;
      state.email = "";
      state.token = "";
      state.surveySession = "";
      setLoginFunction(false, "", "", "");
    },
    setSession: (state, action: PayloadAction<{ surveySession: string }>) => {
      const { surveySession } = action.payload;
      state.surveySession = surveySession;
      setSessionFunction(surveySession);
    },
  },
});

export const { setUserData, clearUserData, setSession } = loginSlice.actions;

export default loginSlice.reducer;
