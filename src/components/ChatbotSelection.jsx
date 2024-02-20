import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";

// Swiper styles
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";

import { EffectCoverflow, Pagination } from "swiper/modules";

import classes from "./ChatbotSelection.module.css";

const ChatbotSelection = () => {
  const chatbots = useSelector((state) => state.chatbot.chatbots);
  const navigate = useNavigate();

  return (
    <div className={classes.container}>
      <Swiper
        effect={"coverflow"}
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={"auto"}
        coverflowEffect={{
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true,
        }}
        pagination={true}
        modules={[EffectCoverflow, Pagination]}
        className={classes.swiper}
      >
        {chatbots.map((bot) => (
          <SwiperSlide key={bot.id} onClick={() => navigate(`/${bot.id}`)}>
            <div className={classes.card}>
              <img src={bot.image} alt={bot.name} className={classes.image} />
              <div className={classes.info}>
                <h2>{bot.name}</h2>
                <p>{bot.description}</p>
                <button className={classes.button}>채팅 참여하기</button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ChatbotSelection;
