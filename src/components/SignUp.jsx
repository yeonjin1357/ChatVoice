import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import { ref, set } from "firebase/database";

import classes from "./SignUp.module.css";

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");

  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: name,
      });

      // 사용자 정보를 Realtime Database에 저장
      await set(ref(db, "users/" + user.uid), {
        name: name,
        age: age,
        gender: gender,
        email: email,
        coin: 5,
      });

      // 이메일 인증 요청
      sendEmailVerification(user)
        .then(() => {
          alert("인증 메일이 발송되었습니다. 메일을 확인해 주세요.");
        })
        .catch((error) => {
          console.error("인증 메일 발송 실패:", error);
        });

      alert("회원가입 성공! 이메일 인증을 진행해 주세요.");
      navigate("/");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        alert("이미 사용 중인 이메일 주소입니다.");
      } else if (error.code === "auth/invalid-email") {
        alert("잘못된 이메일 형식입니다. 올바른 이메일 주소를 입력해주세요.");
      } else if (error.code === "auth/weak-password") {
        alert("비밀번호가 너무 약합니다. 보다 강력한 비밀번호를 사용해주세요.");
      } else if (error.code === "auth/network-request-failed") {
        alert("네트워크 문제가 발생했습니다. 인터넷 연결을 확인해주세요.");
      } else {
        alert("회원가입 중 오류가 발생했습니다. 다시 시도해주세요.");
        console.error("SignUp failed", error);
        // 다른 에러 메시지 처리
      }
    }
  };

  return (
    <div className={classes.signup_container}>
      <article>
        <div className={classes.signup_head}>
          <div className={classes.logo_img}>
            <img src="images/logo.svg" alt="Logo" />
          </div>
          <h2 className={classes.title}>회원가입</h2>
        </div>
        <form className={classes.signup_form} onSubmit={handleSignUp}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="이메일" required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호" required />
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="비밀번호 확인" required />
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="이름" required />
          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="나이" required />
          <select value={gender} onChange={(e) => setGender(e.target.value)} required>
            <option value="">성별 선택</option>
            <option value="male">남자</option>
            <option value="female">여자</option>
          </select>
          <button type="submit">회원가입</button>
        </form>
        <p className={classes.signup_link}>
          이미 계정이 있으신가요? <Link to="/login">로그인 화면으로 돌아가기</Link>
        </p>
      </article>
    </div>
  );
}

export default SignUp;
