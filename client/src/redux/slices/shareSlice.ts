import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const shareLink = localStorage.getItem("sharelink");
const shareParams: string = shareLink !== null ? shareLink : "";

const setShareFunction = (shareLink: string) => {
  localStorage.setItem("sharelink", shareLink);
};

interface ShareState {
  shareLink: string;
}

const initialState: ShareState = {
  shareLink: shareParams,
};

export const shareSlice = createSlice({
  name: "urlslice",
  initialState,
  reducers: {
    setShareParams: (
      state,
      action: PayloadAction<{
        shareLink: string;
      }>
    ) => {
      state.shareLink = action.payload.shareLink;
      setShareFunction(action.payload.shareLink);
    },
  },
});

export const { setShareParams } = shareSlice.actions;

export default shareSlice.reducer;
