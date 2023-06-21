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

const setLoginFunction = (loggedIn, email, token) => {
  localStorage.setItem("loggedIn", JSON.stringify(loggedIn));
  localStorage.setItem("email", JSON.stringify(email));
  localStorage.setItem("token", JSON.stringify(token));
};

const initialState = {
  loggedIn: loggedIn,
  email: email,
  token: token,
};

export const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.loggedIn = action.payload.loggedIn;
      state.email = action.payload.email;
      state.token = action.payload.token;
      setLoginFunction(
        action.payload.loggedIn,
        action.payload.email,
        action.payload.token
      );
    },
    clearUserData: (state, action) => {
      state.loggedIn = false;
      state.email = "";
      state.token = "";
      setLoginFunction(false, "", "");
    },
  },
});

export const { setUserData, clearUserData } = loginSlice.actions;

export default loginSlice.reducer;
