import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword, setPersistence, browserSessionPersistence } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";

import { scrollToElement } from "../utils/common";
import classes from "./Login.module.css";

function Login() {
  const [email, setEmail] = useState(""); // 이메일 상태
  const [password, setPassword] = useState(""); // 비밀번호 상태
  const navigate = useNavigate(); // 페이지 네비게이션 함수

  useEffect(() => {
    // 사용자 로그인 상태 감지
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/select"); // 로그인 상태이면 채팅방으로 이동
      }
    });
    return () => unsubscribe(); // 컴포넌트가 언마운트될 때 구독 해제
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault(); // 폼 제출 기본 동작 방지
    try {
      await setPersistence(auth, browserSessionPersistence); // 세션 지속성 설정
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential.user.emailVerified) {
        alert("이메일 인증이 필요합니다. 이메일을 확인해주세요.");
        return;
      }
      navigate("/select"); // 로그인 성공 시 채팅방으로 리다이렉션
    } catch (error) {
      alert("로그인 정보가 정확하지 않습니다.");
      console.error("로그인 실패:", error.message);
    }
  };

  const handleFocus = (e) => {
    scrollToElement(`#${e.target.id}`);
  };

  return (
    <div className={classes.loginContainer}>
      <article>
        <div className={classes.imgBox}>
          <div>
            <img src="images/message.webp" alt="" />
          </div>
        </div>
        <div className={classes.formBox}>
          <div className={classes.loginHead}>
            <div className={classes.logoImg}>
              <img src="images/logo.webp" alt="" />
            </div>
            <h2 className={classes.title}>로그인</h2>
          </div>
          <form className={classes.loginForm} onSubmit={handleLogin}>
            <input type="email" id="email" value={email} onFocus={handleFocus} onChange={(e) => setEmail(e.target.value)} placeholder="이메일" required />
            <input type="password" id="password" value={password} onFocus={handleFocus} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호" required />
            <button type="submit">로그인</button>
          </form>
          <p className={classes.signUpLink}>
            계정이 없으신가요? <Link to="/signup">회원가입하기</Link>
          </p>
          <div className={classes.testLogin}>
            <p>
              Test ID : fecohi3166@kravify.com <br />
              Test PW : 123456
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}

export default Login;
