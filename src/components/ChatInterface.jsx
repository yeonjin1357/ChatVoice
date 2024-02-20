import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { db } from "../firebaseConfig";
import { ref, set, get, onValue } from "firebase/database";
import OpenAI from "openai"; // OpenAI GPT 사용을 위한 라이브러리

import Loading from "./Loading";
import PropTypes from "prop-types";
import classes from "./ChatInterface.module.css";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_MY_API_KEY, // OpenAI API 키 환경변수에서 가져오기
  dangerouslyAllowBrowser: true, // 브라우저에서 API 호출 허용 (주의: 실제 배포시 보안 위험)
});

const ChatInterface = () => {
  const [userInput, setUserInput] = useState(""); // 사용자 입력 관리
  const [messages, setMessages] = useState([]); // 대화 내역 관리
  const [isProcessing, setIsProcessing] = useState(false); // AI 응답 처리 중 상태 관리
  const [userCoin, setUserCoin] = useState(0); // 사용자 코인 수 관리
  const [showModal, setShowModal] = useState(false); // 모달 표시 여부 관리
  const [loading, setLoading] = useState(false); // 로딩 상태 관리

  const { assistantId } = useParams(); // URL로부터 assistantId를 가져옴
  const messagesEndRef = useRef(null); // 메시지 목록의 끝을 가리키는 ref
  const currentUser = useSelector((state) => state.user.currentUser); // 현재 로그인한 사용자 정보
  const chatbots = useSelector((state) => state.chatbot.chatbots); // 모든 챗봇의 정보

  const userId = currentUser?.uid; // 사용자 UID
  const currentBot = chatbots.find((bot) => bot.id === assistantId); // 현재 선택된 챗봇의 정보를 찾음

  // 새로운 스레드 ID를 데이터베이스에 저장하는 함수
  const saveThreadIDToDatabase = async (userId, assistantId, threadId) => {
    await set(ref(db, `threads/${userId}/${assistantId}`), { threadId });
  };

  // 데이터베이스에서 사용자의 스레드 ID를 가져오는 함수
  const getThreadIDFromDatabase = async (userId) => {
    const snapshot = await get(ref(db, `threads/${userId}/${assistantId}`));
    if (snapshot.exists()) {
      return snapshot.val().threadId;
    } else {
      const response = await openai.beta.threads.create(); // 스레드 ID가 없는 경우 새 스레드 생성 후 저장
      const newThreadId = response.id;
      await saveThreadIDToDatabase(userId, assistantId, newThreadId);
      return newThreadId;
    }
  };

  // 모든 메시지를 삭제하는 함수
  const threadDelete = async () => {
    const threadID = await getThreadIDFromDatabase(userId, assistantId);
    try {
      await openai.beta.threads.del(threadID);
      await set(ref(db, `threads/${userId}/${assistantId}`), null); // 데이터베이스에서 스레드 정보 삭제
    } catch (error) {
      console.error("스레드 삭제 중 오류 발생:", error);
    }
  };

  // 스레드의 메시지를 가져오는 함수
  const fetchMessages = async () => {
    const threadID = await getThreadIDFromDatabase(userId);
    try {
      const threadMessages = await openai.beta.threads.messages.list(threadID);
      setMessages(threadMessages.data.reverse());
      // 메시지 목록이 비어있으면 초기 인사 메시지를 전송
      if (threadMessages.data.length === 0) {
        sendInitialGreeting();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 초기 인사 메시지 전송 함수
  const sendInitialGreeting = async () => {
    // 초기 인사 메시지를 '안녕하세요'로 설정
    const initialGreeting = "안녕하세요";
    const threadID = await getThreadIDFromDatabase(userId);

    try {
      // 서버에만 '안녕하세요' 메시지를 전송하고 사용자 UI에는 표시하지 않음
      await openai.beta.threads.messages.create(threadID, {
        role: "user",
        content: initialGreeting,
      });

      // AI의 응답을 기다린 후 메시지 목록을 업데이트
      await runAnswer(threadID);
    } catch (error) {
      console.error("초기 인사 메시지 전송 중 오류 발생:", error);
    }
  };

  // useEffect 내에서 sendInitialGreeting 호출 제거
  useEffect(() => {
    if (userId) {
      fetchMessages(); // 사용자 접속 시 메시지 목록을 가져오고, 필요한 경우 초기 인사 메시지 전송
    }
  }, [userId]);

  useEffect(() => {
    const userRef = ref(db, `users/${userId}`);

    const unsubscribe = onValue(userRef, (snapshot) => {
      const userData = snapshot.val();
      if (userData && userData.coin !== undefined) {
        setUserCoin(userData.coin);
      }
    });

    return () => unsubscribe();
  }, [userId]);

  // 사용자 메시지 전송 및 코인 처리
  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const userRef = ref(db, `users/${userId}`);
    const userSnapshot = await get(userRef);
    const userData = userSnapshot.val();

    if (userData.coin <= 0) {
      alert("코인이 부족합니다.");
      return; // 코인이 없으면 여기서 함수 종료
    }

    const threadID = await getThreadIDFromDatabase(userId);

    try {
      const newMessage = { role: "user", content: [{ type: "text", text: { value: userInput } }] };
      setMessages((prev) => [...prev, newMessage]);
      await openai.beta.threads.messages.create(threadID, {
        role: "user",
        content: userInput,
      });
      setUserInput("");

      // 코인 차감 및 메시지 누적수, 마지막 메시지 내용 업데이트
      const newMessageCount = (userData.messageCount || 0) + 1;
      await set(ref(db, `users/${userId}`), {
        ...userData,
        coin: userData.coin - 1,
        messageCount: newMessageCount,
        lastMessage: userInput,
      });

      await runAnswer(threadID);
    } catch (error) {
      console.error(error);
    }
  };

  // AI 어시스턴트의 답변 처리
  const runAnswer = async (threadID) => {
    try {
      setIsProcessing(true);
      const tempMessageId = Date.now();
      setMessages((prev) => [...prev, { id: tempMessageId, role: "system", content: [{ type: "text", text: { value: "메시지를 작성 중..." } }] }]);

      const creationResponse = await openai.beta.threads.runs.create(threadID, {
        assistant_id: assistantId,
      });

      const runID = creationResponse.id;

      let retrievalResponse = await openai.beta.threads.runs.retrieve(threadID, runID);
      while (retrievalResponse.status !== "completed") {
        if (["failed", "cancelled"].includes(retrievalResponse.status)) {
          throw new Error(`답변 생성 작업 ${retrievalResponse.status}`);
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
        retrievalResponse = await openai.beta.threads.runs.retrieve(threadID, runID);
      }
      setIsProcessing(false);
      fetchMessages();
    } catch (error) {
      console.error("Error running answer:", error);
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await sendMessage();
  };

  // 메시지 입력 처리
  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  // 스크롤을 메시지 목록의 끝으로 이동
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 메시지 목록 업데이트 시 스크롤 조정
  useEffect(() => {
    console.log(messages);
    scrollToBottom();
  }, [messages]);

  // 모든 메시지 삭제 처리
  const handleDeleteAllMessages = async () => {
    const isConfirmed = window.confirm("메시지를 정말 모두 삭제하겠습니까?");
    if (isConfirmed) {
      setLoading(true); // 로딩 상태 활성화
      await threadDelete();
      fetchMessages();
      setTimeout(() => setLoading(false), 2000); // 메시지 삭제 2초 후 로딩 상태 비활성화
    }
  };

  // 모달 표시 함수
  const Modal = ({ showModal, setShowModal }) => {
    const modalRef = useRef();

    const closeModal = (e) => {
      if (modalRef.current === e.target) {
        setShowModal(false);
      }
    };

    return showModal ? (
      <div className={classes.modalBackground} ref={modalRef} onClick={closeModal}>
        <div className={classes.modalContent}>
          <div className={classes.closeModalBtn} onClick={() => setShowModal(false)}>
            <img src="images/close_icon.png" alt="" />
          </div>
          <div className={classes.modalText}>
            <ul>
              <li>
                <div>
                  <img src="images/coin.png" alt="" />
                </div>
                <p>
                  <b>코인</b>은 메시지를 보낼 때 사용됩니다.
                </p>
              </li>
              <li>
                <div>
                  <img src="images/time_icon.png" alt="" />
                </div>
                <p>
                  <b>2시간</b>마다 1코인씩 자동으로 충전됩니다.
                </p>
              </li>
              <li>
                <div className={classes.coin_icon}>
                  <img src="images/coins.png" alt="" />
                </div>
                <p>
                  {" "}
                  <b>최대 5코인</b>을 보유할 수 있습니다.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    ) : null;
  };

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  Modal.propTypes = {
    showModal: PropTypes.bool.isRequired,
    setShowModal: PropTypes.func.isRequired,
  };

  return (
    <>
      {loading ? (
        <Loading /> // 로딩 컴포넌트 표시
      ) : (
        <div className={classes.chatInterface}>
          <div className={classes.messagesWrap}>
            <div className={classes.messagesHead}>
              <div className={classes.coin}>
                <ul>
                  <li>
                    <div className={classes.tooltipIcon} onClick={toggleModal}>
                      <img src="images/question_icon.png" alt="" />
                    </div>
                  </li>
                  <li>
                    <p>남은 코인 : </p>
                  </li>
                  <li className={classes.coinList}>
                    {Array.from({ length: userCoin }, (_, i) => (
                      <div key={i} role="img" aria-label="coin" onClick={toggleModal}>
                        <img src="images/coin.png" alt="" />
                      </div>
                    ))}
                  </li>
                </ul>
              </div>
            </div>
            <div className={classes.messages}>
              {messages
                .filter((_, index) => index !== messages.findIndex((msg) => msg.role === "user"))
                .map((message, index) => (
                  <div key={index} className={message.role === "user" ? classes.userMessage : classes.assistantMessage}>
                    {message.role !== "user" && (
                      <div className={classes.assistantImg}>
                        <img src={currentBot?.profile} alt={currentBot?.name} />
                      </div>
                    )}
                    <div className={classes.messageText}>
                      {message.role !== "user" && <h3 className={classes.name}>{currentBot?.name}</h3>}
                      {message.content.map((content, contentIndex) => (content.type === "text" ? <span key={contentIndex}>{content.text.value}</span> : null))}
                      {/* 메시지 발송 시간 추가 */}
                      <p className={classes.messageTimestamp}>
                        {message.created_at
                          ? new Date(message.created_at * 1000).toLocaleDateString("ko-KR") === new Date().toLocaleDateString("ko-KR")
                            ? new Date(message.created_at * 1000).toLocaleTimeString("ko-KR", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true, // 12시간제로 표시
                              })
                            : `${new Date(message.created_at * 1000).toLocaleDateString("ko-KR")} ${new Date(message.created_at * 1000).toLocaleTimeString("ko-KR", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true, // 12시간제로 표시
                              })}`
                          : ""}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
            <form onSubmit={handleSubmit} className={classes.messageForm}>
              <div className={classes.delete} onClick={handleDeleteAllMessages}>
                <img src="images/recycle_bin_icon.png" alt="" />
              </div>
              <input type="text" enterKeyHint="enter" value={userInput} onChange={handleInputChange} className={`${classes.inputField} ${isProcessing || userCoin <= 0 ? classes.disabled : ""}`} disabled={isProcessing || userCoin <= 0} placeholder={userCoin <= 0 ? "코인이 부족합니다" : "메시지를 입력하세요"} />
              <button type="submit" className={`${classes.sendButton} ${isProcessing || userCoin <= 0 ? classes.disabled : ""}`} disabled={isProcessing || userCoin <= 0}>
                {isProcessing ? <p>대기...</p> : <p>전송</p>}
              </button>
            </form>
          </div>
        </div>
      )}
      <Modal showModal={showModal} setShowModal={setShowModal} />
    </>
  );
};

export default ChatInterface;
//24/02/13
