import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { setUser } from "../features/user/userSlice";

import { scrollToElement } from "../utils/common";
import classes from "./SignUp.module.css";

function SignUp() {
  // 사용자 입력 관리를 위한 상태
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSignUp = async (e) => {
    e.preventDefault(); // 폼 기본 제출 이벤트 방지
    if (password !== confirmPassword) {
      alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }
    try {
      // Firebase Auth를 사용한 이메일과 비밀번호로 회원가입
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Firebase Auth 사용자 프로필 업데이트
      await updateProfile(user, {
        displayName: lastName + firstName,
      });

      // 사용자 정보를 Firebase Realtime Database에 저장
      await set(ref(db, "users/" + user.uid), {
        lastName: lastName,
        firstName: firstName,
        age: age,
        gender: gender,
        email: email,
        coin: 5,
        messageCount: 0,
        recycleCount: 0,
        lastMessage: "",
      });

      const userRef = ref(db, `users/${user.uid}`);
      const snapshot = await get(userRef);
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

      // 사용자 이메일 인증 요청
      sendEmailVerification(user)
        .then(() => {
          alert("인증 메일이 발송되었습니다. 메일을 확인해 주세요.");
          navigate("/select"); // 회원가입 성공 후 채팅방으로 이동
        })
        .catch((error) => {
          console.error("인증 메일 발송 실패:", error);
        });
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
      }
    }
  };

  const handleFocus = (e) => {
    scrollToElement(`#${e.target.id}`);
  };

  return (
    <div className={classes.signUpContainer}>
      <article>
        <div className={classes.imgBox}>
          <div>
            <img src="images/message.png" alt="" />
          </div>
        </div>
        <div className={classes.formBox}>
          <div className={classes.signUpHead}>
            <div className={classes.logoImg}>
              <img src="images/logo.png" alt="Logo" />
            </div>
            <h2 className={classes.title}>회원가입</h2>
          </div>
          <form className={classes.signUpForm} onSubmit={handleSignUp}>
            <input type="email" id="email" value={email} onFocus={handleFocus} onChange={(e) => setEmail(e.target.value)} placeholder="이메일" required />
            <input type="password" id="password" value={password} onFocus={handleFocus} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호" required />
            <input type="password" id="passwordCheck" value={confirmPassword} onFocus={handleFocus} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="비밀번호 확인" required />
            <div className={classes.nameInput}>
              <input type="text" id="lastName" value={lastName} onFocus={handleFocus} onChange={(e) => setLastName(e.target.value)} placeholder="성" required maxLength="2" />
              <input type="text" id="firstName" value={firstName} onFocus={handleFocus} onChange={(e) => setFirstName(e.target.value)} placeholder="이름" required maxLength="4" />
            </div>
            <input type="number" id="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="나이" required />
            <select value={gender} id="gender" onFocus={handleFocus} onChange={(e) => setGender(e.target.value)} required>
              <option value="">성별 선택</option>
              <option value="male">남자</option>
              <option value="female">여자</option>
            </select>
            <button type="submit">회원가입</button>
          </form>
          <p className={classes.signUpLink}>
            이미 계정이 있으신가요? <br className="br480" />
            <Link to="/login">로그인 화면으로 돌아가기</Link>
          </p>
        </div>
      </article>
    </div>
  );
}

export default SignUp;
