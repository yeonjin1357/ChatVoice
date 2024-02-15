// VerifyEmail.jsx
import { useEffect, useState } from "react";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "../firebaseConfig";
import classes from "./VerifyEmail.module.css";

function VerifyEmail() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      auth.currentUser.reload().then(() => {
        if (auth.currentUser.emailVerified) {
          clearInterval(interval);
          // 상태 업데이트 또는 부모 컴포넌트에 알림. 여기선 단순화를 위해 상태만 확인합니다.
          window.location.reload(); // 간단하게 페이지를 새로고침하여 변경된 상태를 반영합니다.
        }
      });
    }, 3000); // 3초마다 사용자의 이메일 인증 상태를 확인

    return () => clearInterval(interval); // 컴포넌트가 언마운트될 때 인터벌 해제
  }, []);

  const resendEmailVerification = () => {
    sendEmailVerification(auth.currentUser)
      .then(() => {
        setMessage("인증 메일이 재발송되었습니다. 메일함을 확인해주세요.");
      })
      .catch((error) => {
        setMessage("인증 메일 재발송 중 오류가 발생했습니다. 나중에 다시 시도해주세요.");
        console.error("인증 메일 재발송 실패:", error);
      });
  };

  return (
    <div className={classes.verifyEmail}>
      <article>
        <h2>이메일 인증 대기 중...</h2>
        <p>계속하기 전에, 회원가입 시 사용한 이메일로 발송된 인증 메일 내 링크를 클릭하여 인증을 완료해주세요.</p>
        <button onClick={resendEmailVerification}>인증 메일 재발송</button>
        {message && <p>{message}</p>}
      </article>
    </div>
  );
}

export default VerifyEmail;
