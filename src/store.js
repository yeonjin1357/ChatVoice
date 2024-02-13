// src/app/store.js
import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./features/theme/themeSlice";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
  },
});
