import { createSlice } from "@reduxjs/toolkit";

const consent =
  localStorage.getItem("consent") !== null
    ? JSON.parse(localStorage.getItem("consent"))
    : false;

// adding this function to prevent repear code
const setConsentFunction = (consent) => {
  localStorage.setItem("consent", JSON.stringify(consent));
};

const initialState = {
  consent: consent,
};

export const consentSlice = createSlice({
  name: "consent",
  initialState,
  reducers: {
    setConsent: (state) => {
      state.consent = true;
      setConsentFunction(true);
    },
  },
});

// Action creators are generated for each case reducer function
export const { setConsent } = consentSlice.actions;

export default consentSlice.reducer;
