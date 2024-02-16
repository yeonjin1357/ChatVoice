import { createSlice } from "@reduxjs/toolkit";

export const themeSlice = createSlice({
  name: "theme",
  initialState: "dark", // 초기 상태는 'dark'
  reducers: {
    toggle: (state) => (state === "light" ? "dark" : "light"),
  },
});

export const { toggle } = themeSlice.actions;

export default themeSlice.reducer;
