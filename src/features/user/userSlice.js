import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null, // 현재 유저 객체를 null로 초기화
  isEmailVerified: false, // 이메일 인증 여부를 false로 초기화
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { uid, email, emailVerified, name, age, gender, coin } = action.payload;
      // currentUser에 필요한 정보만 선택하여 저장
      state.currentUser = {
        uid,
        email,
        name,
        age,
        gender,
        coin,
      };
      state.isEmailVerified = emailVerified ?? false;
    },
    clearUser: (state) => {
      state.currentUser = null;
      state.isEmailVerified = false;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;
