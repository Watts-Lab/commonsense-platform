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
      // Update the state
      const updatedParams = action.payload.urlParams.reduce(
        (accumulator, newParam) => {
          // Check if param already exists
          const index = accumulator.findIndex((p) => p.key === newParam.key);
          if (index > -1) {
            // Update the existing parameter
            accumulator[index].value = newParam.value;
          } else {
            accumulator.push(newParam);
          }
          return accumulator;
        },
        [...state.urlParams]
      );

      state.urlParams = updatedParams;

      setUrlFunction(updatedParams);
    },
  },
});

export const { setUrlParams } = urlSlice.actions;

export default urlSlice.reducer;
