import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";

// Swiper styles
import "swiper/css";
import "swiper/css/effect-cards";
import "swiper/css/pagination";

import { EffectCards, Pagination } from "swiper/modules";

import classes from "./ChatbotSelection.module.css";

const ChatbotSelection = () => {
  const chatbots = useSelector((state) => state.chatbot.chatbots);
  const navigate = useNavigate();

  return (
    <div className={classes.container}>
      <Swiper effect={"cards"} grabCursor={true} centeredSlides={true} slidesPerView={"auto"} pagination={true} modules={[EffectCards, Pagination]} className={classes.swiper}>
        {chatbots.map((bot) => (
          <SwiperSlide key={bot.id}>
            <div className={classes.card}>
              <div className={classes.profileBg} style={{ backgroundImage: `url(${bot.profileBg})` }}>
                <div className={classes.profileImg}>
                  <img src={bot.profile} alt={bot.name} />
                </div>
              </div>
              <div className={classes.info}>
                <div className={classes.name}>
                  <h2>{bot.name}</h2>
                  <p>{bot.description}</p>
                </div>
                <div className={classes.follow}>
                  <ul className={classes.list}>
                    <li>
                      <div className={classes.followers}>
                        <h2>{bot.followers}</h2>
                        <p>Followers</p>
                      </div>
                    </li>
                    <li>
                      <div className={classes.following}>
                        <h2>{bot.following}</h2>
                        <p>Following</p>
                      </div>
                    </li>
                  </ul>
                  <button onClick={() => navigate(`/${bot.id}`)} className={classes.button}>
                    채팅 참여하기
                  </button>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ChatbotSelection;
