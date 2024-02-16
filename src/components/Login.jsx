import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword, setPersistence, browserSessionPersistence } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth"; // 사용자 로그인 상태 확인을 위해 추가

import classes from "./Login.module.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // 컴포넌트가 마운트될 때, 사용자의 로그인 상태를 확인합니다.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // 이미 로그인된 상태이면 메인 페이지(`/`)로 리다이렉션합니다.
        navigate("/");
      }
    });
    return () => unsubscribe(); // 컴포넌트가 언마운트될 때 구독 해제
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await setPersistence(auth, browserSessionPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential.user.emailVerified) {
        alert("이메일 인증이 필요합니다. 이메일을 확인해주세요.");
        return;
      }
      // 로그인 성공 처리, 여기서는 사용자를 메인 페이지(`/`)로 리다이렉션합니다.
      navigate("/");
    } catch (error) {
      alert("로그인 정보가 정확하지 않습니다.");
      console.error("로그인 실패:", error.message);
    }
  };

  return (
    <div className={classes.login_container}>
      <article>
        <div className={classes.img_box}>
          <div>
            <img src="images/message.png" alt="" />
          </div>
        </div>
        <div className={classes.form_box}>
          <div className={classes.login_head}>
            <div className={classes.logo_img}>
              <img src="images/logo.png" alt="" />
            </div>
            <h2 className={classes.title}>로그인</h2>
          </div>
          <form className={classes.login_form} onSubmit={handleLogin}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="이메일" required />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호" required />
            <button type="submit">로그인</button>
          </form>
          <p className={classes.signup_link}>
            계정이 없으신가요? <Link to="/signup">회원가입하기</Link>
          </p>
        </div>
      </article>
    </div>
  );
}

export default Login;
