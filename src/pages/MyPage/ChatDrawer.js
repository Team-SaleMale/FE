import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import styles from "../../styles/MyPage/ChatDrawer.module.css";
import { chatService } from "../../api/chat/service";

export default function ChatDrawer({ open, onClose, onBack, item, userId }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [canSend, setCanSend] = useState(true);
  const [chatInfo, setChatInfo] = useState(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      // chatId가 있으면 채팅방 입장
      if (item?.chatId && userId) {
        enterChat();
      }
    } else {
      document.body.style.overflow = "";
      // 채팅방을 나갈 때 exit API 호출
      if (chatInfo?.chatId && userId) {
        exitChat();
      }
    }
    return () => {
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item?.chatId, userId]);

  const enterChat = async () => {
    if (!item?.chatId || !userId) {
      console.error('chatId 또는 userId가 없습니다.');
      return;
    }

    setLoading(true);
    try {
      const response = await chatService.enterChatRoom(item.chatId, userId, { page: 0, size: 50 });
      console.log('채팅방 입장 응답:', response);

      const data = response?.data || response;

      // 채팅방 정보 저장
      setChatInfo({
        chatId: data.chatId,
        readerId: data.readerId,
        unreadCountAfter: data.unreadCountAfter,
      });

      // 메시지 변환 (API 형식 -> UI 형식)
      const formattedMessages = (data.messages || []).map((msg) => ({
        id: msg.messageId,
        sender: msg.senderId === userId ? "me" : "other",
        text: msg.content,
        time: new Date(msg.sentAt).toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        read: msg.read,
        type: msg.type,
      }));

      setMessages(formattedMessages);
      setCanSend(data.canSend !== false);

      // 읽음 처리된 메시지 개수 로그
      if (data.updatedCount > 0) {
        console.log(`${data.updatedCount}개의 메시지를 읽음 처리했습니다.`);
      }
    } catch (error) {
      console.error('채팅방 입장 실패:', error);
      setMessages([]);
      setCanSend(false);
    } finally {
      setLoading(false);
    }
  };

  const exitChat = async () => {
    if (!chatInfo?.chatId || !userId) {
      return;
    }

    try {
      await chatService.exitChatRoom(chatInfo.chatId, userId);
      console.log('채팅방 나가기 완료:', chatInfo.chatId);

      // 채팅방 정보 초기화
      setChatInfo(null);
      setMessages([]);
    } catch (error) {
      console.error('채팅방 나가기 실패:', error);
      // 실패해도 UI는 정상적으로 닫기
    }
  };

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
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>메시지를 불러오는 중...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className={styles.emptyContainer}>
              <Icon icon="solar:chat-line-linear" className={styles.emptyIcon} />
              <p className={styles.emptyText}>아직 메시지가 없습니다.</p>
            </div>
          ) : (
            messages.map((msg) => (
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
            ))
          )}
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
            disabled={!message.trim() || !canSend}
            aria-label="전송"
          >
            <Icon icon="solar:plain-3-linear" />
          </button>
        </div>
      </div>
    </>
  );
}
