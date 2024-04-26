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
  const theme = useSelector((state) => state.theme); // 현재 테마 상태
  const [loading, setLoading] = useState(true); // 로딩 상태 관리
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true); // 로딩 상태 활성화
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
              ...userData,
            })
          );
        } else {
          dispatch(clearUser()); // 데이터베이스에 사용자 정보가 없으면 사용자 상태를 초기화
        }
      } else {
        dispatch(clearUser()); // 사용자가 로그아웃한 경우 사용자 상태 초기화
      }
      setLoading(false); // 로딩 상태 비활성화
    });
    return () => unsubscribe(); // 컴포넌트 언마운트 시 구독 해제
  }, [dispatch]);

  if (loading) {
    return <Loading></Loading>; // 로딩 중 로딩 컴포넌트 표시
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
              <Route path="*" element={<Navigate replace to={currentUser ? "/select" : "/login"} />} />
            </Routes>
          </>
        )}
      </div>
    </Router>
  );
}

export default App;
