import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import styles from "../../styles/MyPage/ChatDrawer.module.css";

export default function ChatDrawer({ open, onClose, onBack, item }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "other",
      text: "안녕하세요! 상품 문의드립니다.",
      time: "오후 2:30",
    },
    {
      id: 2,
      sender: "me",
      text: "네, 말씀하세요!",
      time: "오후 2:31",
    },
  ]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: "me",
      text: message,
      time: new Date().toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };

    setMessages([...messages, newMessage]);
    setMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!open) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.drawer}>
        {/* 헤더 */}
        <header className={styles.header}>
          <button className={styles.close} onClick={onBack} aria-label="뒤로 가기">
            <Icon icon="solar:alt-arrow-left-linear" />
          </button>
          <div className={styles.headerInfo}>
            <div className={styles.avatar}>
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
                alt="판매자"
              />
            </div>
            <div className={styles.userInfo}>
              <h3 className={styles.userName}>울릉한소우주강황</h3>
              <p className={styles.location}>서울 강서구 가양제3동</p>
            </div>
          </div>
        </header>

        {/* 상품 정보 */}
        {item && (
          <div className={styles.productInfo}>
            <img
              src={item.image || item.images?.[0]}
              alt={item.title}
              className={styles.productImage}
            />
            <div className={styles.productDetails}>
              <p className={styles.productTitle}>{item.title}</p>
              <p className={styles.productPrice}>₩ {item.currentPrice?.toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* 채팅 메시지 영역 */}
        <div className={styles.messagesContainer}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`${styles.messageWrapper} ${
                msg.sender === "me" ? styles.myMessage : styles.otherMessage
              }`}
            >
              {msg.sender === "other" && (
                <div className={styles.messageAvatar}>
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
                    alt="판매자"
                  />
                </div>
              )}
              <div className={styles.messageBubble}>
                <p className={styles.messageText}>{msg.text}</p>
                <span className={styles.messageTime}>{msg.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 입력 영역 */}
        <div className={styles.inputContainer}>
          <button className={styles.attachButton} aria-label="파일 첨부">
            <Icon icon="solar:paperclip-linear" />
          </button>
          <input
            type="text"
            className={styles.input}
            placeholder="메시지를 입력하세요..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            className={styles.sendButton}
            onClick={handleSend}
            disabled={!message.trim()}
            aria-label="전송"
          >
            <Icon icon="solar:plain-3-linear" />
          </button>
        </div>
      </div>
    </>
  );
}
