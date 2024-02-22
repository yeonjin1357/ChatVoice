// features/chatbot/chatbotSlice.js
import { createSlice } from "@reduxjs/toolkit";

// 초기 챗봇 데이터 정의
const initialState = {
  chatbots: [
    { id: "asst_SPf5qm3iYARJOBzgzgmPygIT", name: "지수", description: "J I S O O 💘", profile: "/images/jisoo_500.png", profileBg: "/images/jisoo_bg.png", followers: 372, following: 248 },
    { id: "asst_X2Pw8eRRjqCkAU8w6Dshs1vd", name: "나리", description: "@nari0717", profile: "/images/nari_500.png", profileBg: "/images/nari_bg.png", followers: 2229, following: 820 },
    { id: "asst_3w19JnGssXkFe0OLvMY8oipN", name: "세아", description: "...", profile: "/images/seah_500.png", profileBg: "/images/seah_bg.png", followers: 23, following: 25 },
  ],
};

export const chatbotSlice = createSlice({
  name: "chatbot",
  initialState,
  reducers: {
    // 필요한 추가 액션 정의
  },
});

// 필요한 액션과 리듀서를 export
export default chatbotSlice.reducer;
