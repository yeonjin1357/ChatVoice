// features/chatbot/chatbotSlice.js
import { createSlice } from "@reduxjs/toolkit";

// 초기 챗봇 데이터 정의
const initialState = {
  chatbots: [
    { id: "asst_X2Pw8eRRjqCkAU8w6Dshs1vd", name: "민지", description: "24💘 Designer", profile: "/images/ggomi.png", followers: 372, following: 248 },
    { id: "asst_3w19JnGssXkFe0OLvMY8oipN", name: "주아", description: "챗봇 2의 설명", profile: "/images/saeron.png", followers: 2229, following: 820 },
    { id: "asst_SPf5qm3iYARJOBzgzgmPygIT", name: "해린", description: "챗봇 3의 설명", profile: "/images/siyeon.png", followers: 23, following: 25 },
  ],
};

export const chatbotSlice = createSlice({
  name: "chatbot",
  initialState,
  reducers: {
    // 필요한 추가 액션 정의 (현재 예시에서는 초기 상태만 사용)
  },
});

// 필요한 액션과 리듀서를 export
export default chatbotSlice.reducer;
