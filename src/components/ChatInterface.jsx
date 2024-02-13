import { useState, useEffect, useRef } from "react";
import classes from "./ChatInterface.module.css";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_MY_API_KEY,
  dangerouslyAllowBrowser: true,
});

const ChatInterface = () => {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);

  function generateUserId() {
    return "user_" + Math.random().toString(36).substr(2, 9);
  }

  const userId = localStorage.getItem("userId") || generateUserId();
  localStorage.setItem("userId", userId);

  // 로컬 스토리지에서 threadID 가져오기 또는 새로 생성
  const getOrCreateThreadID = async () => {
    let threadID = localStorage.getItem(`threadId_${userId}`);
    if (!threadID) {
      // threadID가 로컬 스토리지에 없다면 새로 생성
      const response = await openai.beta.threads.create();
      threadID = response.id;
      localStorage.setItem(`threadId_${userId}`, threadID);
    }
    return threadID;
  };

  const fetchMessages = async () => {
    const threadID = await getOrCreateThreadID();
    try {
      setIsFetching(true);
      const threadMessages = await openai.beta.threads.messages.list(threadID);
      setIsFetching(false);
      setMessages(threadMessages.data.reverse());
    } catch (error) {
      console.error(error);
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const threadDelete = async () => {
    const threadID = await getOrCreateThreadID();
    try {
      await openai.beta.threads.del(threadID);
      localStorage.removeItem(`threadId_${userId}`); // 스레드 삭제 후 로컬 스토리지에서도 삭제
    } catch (error) {
      console.error(error);
    }
  };

  const sendMessage = async () => {
    if (!userInput.trim()) return;
    const threadID = await getOrCreateThreadID();

    try {
      setMessages((prev) => [...prev, { role: "user", content: [{ type: "text", text: { value: userInput } }] }]);
      await openai.beta.threads.messages.create(threadID, {
        role: "user",
        content: userInput,
      });
      setUserInput("");
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

  return (
    <div className={classes.chatInterface}>
      <div className={classes.messagesWrap}>
        <div className={classes.messages}>
          {messages.map((message, index) => (
            <div key={index} className={message.role === "user" ? classes.userMessage : classes.assistantMessage}>
              {message.role !== "user" && (
                <div className={classes.assistantImg}>
                  <img src="images/sena.png" alt="" />
                </div>
              )}
              {message.content.map((content, contentIndex) => (content.type === "text" ? <span key={contentIndex}>{content.text.value}</span> : null))}
            </div>
          ))}
          {isFetching && <div className={classes.assistantMessage}>메시지를 불러오는 중...</div>}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className={classes.messageForm}>
          <div className={classes.delete} onClick={handleDeleteAllMessages}>
            <img src="images/trash.svg" alt="" />
          </div>
          <input type="text" value={userInput} onChange={handleInputChange} className={`${classes.inputField} ${isProcessing ? classes.disabled : ""}`} disabled={isProcessing} />
          <button type="submit" className={`${classes.sendButton} ${isProcessing ? classes.disabled : ""}`} disabled={isProcessing}>
            {isProcessing ? "대기..." : "전송"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
//24/02/13
