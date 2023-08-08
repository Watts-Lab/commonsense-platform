import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";

const consentString = localStorage.getItem("consent");
const consent = consentString !== null ? JSON.parse(consentString) : false;

// adding this function to prevent repear code
const setConsentFunction = (consent: boolean) => {
  localStorage.setItem("consent", JSON.stringify(consent));
};

interface ConsentState {
  consent: boolean;
}

const initialState: ConsentState = {
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

export const selectConsent = (state: RootState) => state.consent.consent;

export default consentSlice.reducer;
