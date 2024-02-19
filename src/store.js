// src/app/store.js
import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./features/theme/themeSlice";
import userReducer from "./features/user/userSlice";
import chatbotReducer from "./features/chatbot/chatbotSlice";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    user: userReducer,
    chatbot: chatbotReducer,
  },
});
