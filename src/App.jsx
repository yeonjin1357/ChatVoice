import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import routes from "./router";
import { auth, db } from "./firebaseConfig";
import { ref, get } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { setUser, clearUser } from "./features/user/userSlice";

import Header from "./components/Header";
import VerifyEmail from "./components/VerifyEmail";
import Loading from "./components/Loading";
import classes from "./App.module.css";

function App() {
  const { currentUser, isEmailVerified } = useSelector((state) => state.user);
  const theme = useSelector((state) => state.theme);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true); // 로딩 시작
      if (user) {
        // Firebase Realtime Database에서 사용자 정보를 조회
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          // 조회된 사용자 정보로 Redux 스토어 업데이트
          dispatch(
            setUser({
              uid: user.uid,
              email: user.email,
              emailVerified: user.emailVerified,
              name: userData.name,
              age: userData.age,
              gender: userData.gender,
              coin: userData.coin,
              messageCount: userData.messageCount,
              lastMessage: userData.lastMessage,
            })
          );
        } else {
          // Realtime Database에 사용자 정보가 없는 경우 기본 정보로 설정
          dispatch(
            setUser({
              uid: user.uid,
              email: user.email,
              emailVerified: user.emailVerified,
              name: "",
              age: "",
              gender: "",
              coin: "",
              messageCount: "",
              lastMessage: "",
            })
          );
        }
      } else {
        // 사용자가 로그아웃한 경우
        dispatch(clearUser());
      }
      setLoading(false); // 로딩 완료
    });
    return () => unsubscribe(); // 이벤트 리스너 해제
  }, [dispatch]);

  useEffect(() => {
    const updateVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    updateVH(); // 초기 실행으로 뷰포트 높이 설정
    window.addEventListener("resize", updateVH);
    window.addEventListener("touchend", updateVH); // 모바일 기기에서의 상호작용에 대응

    // cleanup 함수에서 이벤트 리스너를 제거
    return () => {
      window.removeEventListener("resize", updateVH);
      window.removeEventListener("touchend", updateVH);
    };
  }, []); // 빈 의존성 배열을 전달하여 컴포넌트 마운트 시 한 번만 실행되도록 함

  if (loading) {
    return <Loading></Loading>; // 로딩 중에는 로딩 인디케이터 표시
  }

  return (
    <Router>
      <div className={classes.main} data-theme={theme}>
        <Header />
        {currentUser && !isEmailVerified ? (
          <>
            <VerifyEmail />
          </>
        ) : (
          <>
            <Routes>
              {routes.map((route, index) => {
                const Element = route.element;
                // 이메일 인증이 필요 없거나, 인증된 사용자만 접근 가능한 페이지를 처리
                const shouldRender = route.protected ? currentUser && isEmailVerified : true;
                return shouldRender ? <Route key={index} path={route.path} element={<Element />} /> : null;
              })}
              <Route path="*" element={<Navigate replace to={currentUser ? "/" : "/login"} />} />
            </Routes>
          </>
        )}
      </div>
    </Router>
  );
}

export default App;
