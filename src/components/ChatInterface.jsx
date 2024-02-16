import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { db } from "../firebaseConfig"; // Firebase 설정을 가져옵니다.
import { ref, set, get, onValue } from "firebase/database"; // Firebase Realtime Database 함수를 가져옵니다.
import OpenAI from "openai";

import PropTypes from "prop-types";
import classes from "./ChatInterface.module.css";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_MY_API_KEY,
  dangerouslyAllowBrowser: true,
});

const ChatInterface = () => {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userCoin, setUserCoin] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const messagesEndRef = useRef(null);
  const currentUser = useSelector((state) => state.user.currentUser);
  const userId = currentUser?.uid;

  const saveThreadIDToDatabase = async (userId, threadId) => {
    await set(ref(db, `threads/${userId}`), { threadId });
  };

  const getThreadIDFromDatabase = async (userId) => {
    const snapshot = await get(ref(db, `threads/${userId}`));
    if (snapshot.exists()) {
      return snapshot.val().threadId;
    } else {
      // 스레드 ID가 없는 경우 새 스레드 생성 후 저장
      const response = await openai.beta.threads.create();
      const newThreadId = response.id;
      await saveThreadIDToDatabase(userId, newThreadId);
      return newThreadId;
    }
  };

  const threadDelete = async () => {
    const threadID = await getThreadIDFromDatabase(userId); // Firebase에서 스레드 ID를 조회
    try {
      // OpenAI 스레드 삭제 시도 (API 지원 여부 확인 필요)
      await openai.beta.threads.del(threadID);
      // Firebase 데이터베이스에서 스레드 ID 관련 데이터 삭제
      await set(ref(db, `threads/${userId}`), null);
    } catch (error) {
      console.error("스레드 삭제 중 오류 발생:", error);
    }
  };

  const fetchMessages = async () => {
    const threadID = await getThreadIDFromDatabase(userId);
    try {
      const threadMessages = await openai.beta.threads.messages.list(threadID);
      setMessages(threadMessages.data.reverse());
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchMessages();
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
      setMessages((prev) => [...prev, { role: "user", content: [{ type: "text", text: { value: userInput } }] }]);
      await openai.beta.threads.messages.create(threadID, {
        role: "user",
        content: userInput,
      });
      setUserInput("");

      // 코인 차감
      await set(ref(db, `users/${userId}/coin`), userData.coin - 1);

      await runAnswer(threadID);
    } catch (error) {
      console.error(error);
    }
  };

  const runAnswer = async (threadID) => {
    try {
      setIsProcessing(true);
      const tempMessageId = Date.now();
      setMessages((prev) => [...prev, { id: tempMessageId, role: "system", content: [{ type: "text", text: { value: "메시지를 작성 중..." } }] }]);

      const creationResponse = await openai.beta.threads.runs.create(threadID, {
        assistant_id: "asst_X2Pw8eRRjqCkAU8w6Dshs1vd",
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

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleDeleteAllMessages = async () => {
    const isConfirmed = window.confirm("메시지를 정말 모두 삭제하겠습니까?");
    if (isConfirmed) {
      await threadDelete();
      fetchMessages();
    }
  };

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
      <div className={classes.chatInterface}>
        <div className={classes.messagesWrap}>
          <div className={classes.messages_head}>
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
                <li className={classes.coin_list}>
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
            {messages.map((message, index) => (
              <div key={index} className={message.role === "user" ? classes.userMessage : classes.assistantMessage}>
                {message.role !== "user" && (
                  <div className={classes.assistantImg}>
                    <img src="images/sena.png" alt="" />
                  </div>
                )}
                <div className={classes.messageText}>
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
            <div ref={messagesEndRef} />
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
      <Modal showModal={showModal} setShowModal={setShowModal} />
    </>
  );
};

export default ChatInterface;
//24/02/13
