import { createSlice, PayloadAction } from "@reduxjs/toolkit";



const urlParamsString = localStorage.getItem("urlParams");
const urlParams: Array<{ key: string; value: string }> =
  urlParamsString !== null ? JSON.parse(urlParamsString) : [];

const setUrlFunction = (urlParams: Array<{ key: string; value: string }>) => {
  localStorage.setItem("urlParams", JSON.stringify(urlParams));
};

interface UrlState {
  urlParams: Array<{ key: string; value: string }>;
}

const initialState: UrlState = {
  urlParams: urlParams,
};

export const urlSlice = createSlice({
  name: "urlslice",
  initialState,
  reducers: {
    setUrlParams: (
      state,
      action: PayloadAction<{
        urlParams: Array<{ key: string; value: string }>;
      }>
    ) => {
      state.urlParams = action.payload.urlParams;
      setUrlFunction(action.payload.urlParams);
    },
  },
});

export const { setUrlParams } = urlSlice.actions;

export default urlSlice.reducer;
