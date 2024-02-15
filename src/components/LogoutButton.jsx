import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig"; // 경로는 실제 프로젝트 구조에 맞게 조정해주세요.
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";

import classes from "./LogoutButton.module.css";

const LogoutButton = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    // 사용자에게 로그아웃 의사를 확인
    const isConfirmed = window.confirm("로그아웃 하시겠습니까?");
    if (isConfirmed) {
      try {
        await signOut(auth);
        navigate("/login"); // 로그아웃 후 로그인 페이지로 이동
      } catch (error) {
        console.error("로그아웃 에러", error);
      }
    }
  };

  if (!isLoggedIn) {
    return null; // 로그인하지 않은 상태면 아무것도 보여주지 않음
  }

  return (
    <button className={classes.logout_button} onClick={handleLogout}>
      <i className="fa-solid fa-power-off"></i>
    </button>
  );
};

export default LogoutButton;
