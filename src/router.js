import Login from "./components/Login";
import SignUp from "./components/SignUp";
import ChatbotSelection from "./components/ChatbotSelection"; // 챗봇 선택 컴포넌트
import ChatInterface from "./components/ChatInterface"; // 기존 채팅 인터페이스 컴포넌트

// 라우트를 객체나 배열로 정의
const routes = [
  {
    path: "/login",
    element: Login,
    protected: false, // 로그인이 필요하지 않은 페이지
  },
  {
    path: "/signup",
    element: SignUp,
    protected: false, // 로그인이 필요하지 않은 페이지
  },
  {
    path: "/", // 챗봇 선택 화면 경로
    element: ChatbotSelection,
    protected: true, // 로그인이 필요한 페이지
    verifyEmail: true, // 이메일 인증이 필요한 페이지
  },
  {
    path: "/:assistantId", // 각 챗봇별 채팅 인터페이스 경로
    element: ChatInterface,
    protected: true, // 로그인이 필요한 페이지
    verifyEmail: true, // 이메일 인증이 필요한 페이지
  },
  // 기타 라우트 정의...
];

export default routes;
