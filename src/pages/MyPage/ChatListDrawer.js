import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import styles from "../../styles/MyPage/ChatListDrawer.module.css";
import { chatService } from "../../api/chat/service";

export default function ChatListDrawer({ open, onClose, onSelectChat, userId }) {
  const [chatList, setChatList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      if (userId) {
        fetchChatList();
      }
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userId]);

  const fetchChatList = async () => {
    if (!userId) {
      console.error('userId가 없습니다.');
      return;
    }

    setLoading(true);
    try {
      const response = await chatService.getChatList(userId, { page: 0, size: 50 });
      console.log('채팅방 목록 조회 응답:', response);

      const chatData = response?.data || response || [];
      setChatList(chatData);
    } catch (error) {
      console.error('채팅방 목록 조회 실패:', error);
      setChatList([]);
    } finally {
      setLoading(false);
    }
  };

  // 임시 채팅 목록 데이터 (API 응답에 상세 정보가 없을 경우 표시용)
  const tempChatList = [
    {
      id: 1,
      productImage: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=150&auto=format&fit=crop",
      productTitle: "삼성 갤럭시 Z Fold 6 (512GB)",
      lastMessage: "안녕하세요! 상품 문의드립니다.",
      time: "오후 2:30",
      unreadCount: 2,
      otherUser: {
        name: "김철수",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
      },
    },
    {
      id: 2,
      productImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=150&auto=format&fit=crop",
      productTitle: "애플 에어팟 프로 2세대",
      lastMessage: "네, 내일 직거래 가능합니다.",
      time: "오전 11:20",
      unreadCount: 0,
      otherUser: {
        name: "이영희",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      },
    },
  ];

  if (!open) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.drawer}>
        {/* 헤더 */}
        <header className={styles.header}>
          <button className={styles.close} onClick={onClose} aria-label="닫기">
            <Icon icon="solar:close-circle-linear" />
          </button>
          <h3 className={styles.title}>최근 채팅</h3>
          <div className={styles.headerPlaceholder} />
        </header>

        {/* 채팅 목록 */}
        <div className={styles.chatListContainer}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>채팅 목록을 불러오는 중...</p>
            </div>
          ) : chatList.length === 0 ? (
            <div className={styles.emptyContainer}>
              <Icon icon="solar:chat-line-linear" className={styles.emptyIcon} />
              <p className={styles.emptyText}>아직 채팅방이 없습니다.</p>
            </div>
          ) : (
            chatList.map((chat) => (
              <div
                key={chat.chatId || chat.id}
                className={styles.chatItem}
                onClick={() => onSelectChat(chat)}
              >
                <div className={styles.productImageWrapper}>
                  <img
                    src={chat.productImage || "https://via.placeholder.com/150"}
                    alt={chat.productTitle || "상품"}
                    className={styles.productImage}
                  />
                </div>
                <div className={styles.chatInfo}>
                  <div className={styles.chatHeader}>
                    <span className={styles.userName}>
                      {chat.otherUser?.name || `채팅방 #${chat.chatId}`}
                    </span>
                    <span className={styles.time}>{chat.time || ""}</span>
                  </div>
                  <p className={styles.productTitle}>
                    {chat.productTitle || "상품 정보 없음"}
                  </p>
                  <div className={styles.lastMessageRow}>
                    <p className={styles.lastMessage}>
                      {chat.lastMessage || "메시지를 확인하세요"}
                    </p>
                    {chat.unreadCount > 0 && (
                      <span className={styles.unreadBadge}>{chat.unreadCount}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
