import { configureStore } from '@reduxjs/toolkit';
import loginReducer from './slices/loginSlice';
import consentReducer from './slices/consentSlice';

export const store = configureStore({
  reducer: {
    login: loginReducer,
    consent: consentReducer,
  },
})