import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import classes from "./ChatbotSelection.module.css"; // 스타일을 위한 CSS 모듈

const ChatbotSelection = () => {
  const chatbots = useSelector((state) => state.chatbot.chatbots);
  const navigate = useNavigate();

  return (
    <div className={classes.container}>
      {chatbots.map((bot) => (
        <div className={classes.card} key={bot.id} onClick={() => navigate(`/${bot.id}`)}>
          <img src={bot.image} alt={bot.name} className={classes.image} />
          <div className={classes.info}>
            <h2>{bot.name}</h2>
            <p>{bot.description}</p>
            <button className={classes.button}>채팅 참여하기</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatbotSelection;
