import { configureStore } from '@reduxjs/toolkit';
import loginReducer from './slices/loginSlice';
import consentReducer from './slices/consentSlice';
import urlReducer from './slices/urlSlice';

export const store = configureStore({
  reducer: {
    login: loginReducer,
    consent: consentReducer,
    urlslice: urlReducer,
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch