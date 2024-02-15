import Login from "./components/Login";
import SignUp from "./components/SignUp";
import ChatInterface from "./components/ChatInterface";

// 라우트를 객체나 배열로 정의
const routes = [
  {
    path: "/login",
    element: Login,
    protected: false, // 로그인이 필요하지 않은 페이지
  },
  {
    path: "/signup", // 회원가입 페이지 경로
    element: SignUp,
    protected: false, // 로그인이 필요하지 않은 페이지
  },
  {
    path: "/",
    element: ChatInterface,
    protected: true, // 로그인이 필요한 페이지
    verifyEmail: true, // 이메일 인증이 필요한 페이지
  },
  // 추가 라우트 정의...
];

export default routes;
