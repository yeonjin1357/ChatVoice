import { useLocation } from "react-router-dom";
import ThemeButton from "./ThemeButton";
import LogoutButton from "./LogoutButton";
import BackButton from "./BackButton";
import classes from "./Header.module.css";

const Header = () => {
  const location = useLocation();
  // 경로가 /asst_로 시작하는지 확인
  const isChatRoom = location.pathname.startsWith("/asst_");

  return (
    <header className={classes.header}>
      {isChatRoom && <BackButton />} {/* 채팅방에 있을 때만 BackButton 렌더링 */}
      <LogoutButton></LogoutButton>
      <ThemeButton></ThemeButton>
    </header>
  );
};

export default Header;
