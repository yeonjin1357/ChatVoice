// BackButton.jsx
import { useNavigate } from "react-router-dom";
import classes from "./BackButton.module.css";

const BackButton = () => {
  const navigate = useNavigate();

  // 버튼 클릭 시 /select 경로로 이동 (ChatbotSelect 컴포넌트로 이동)
  const handleClick = () => {
    navigate("/select");
  };

  return (
    <button className={classes.backButton} onClick={handleClick}>
      <i className="fa-solid fa-arrow-left"></i>
    </button>
  );
};

export default BackButton;
