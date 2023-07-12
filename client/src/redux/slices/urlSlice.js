import { createSlice } from "@reduxjs/toolkit";

const urlParams =
  localStorage.getItem("urlParams") !== null
    ? JSON.parse(localStorage.getItem("urlParams"))
    : [];

const setUrlFunction = (urlParams) => {
  localStorage.setItem("urlParams", JSON.stringify(urlParams));
};

const initialState = {
  urlParams: urlParams,
};

export const urlSlice = createSlice({
  name: "urlslice",
  initialState,
  reducers: {
    
    setUrlParams: (state, action) => {
      state.urlParams = action.payload.urlParams;
      setUrlFunction(
        action.payload.urlParams,
      );
    },
    
  },
});

export const { setUrlParams } = urlSlice.actions;

export default urlSlice.reducer;
