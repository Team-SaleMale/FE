import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import styles from "../../../styles/MyPage/Overview/RecentChats.module.css";
import { chatService } from "../../../api/chat/service";

export default function RecentChats({ userId, onChatClick, onViewAll }) {
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchRecentChats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchRecentChats = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const response = await chatService.getChatList(userId, { page: 0, size: 2 });
      console.log('최근 채팅 조회:', response);

      const chatData = response?.data || response || [];
      setRecentChats(chatData);
    } catch (error) {
      console.error('최근 채팅 조회 실패:', error);
      setRecentChats([]);
    } finally {
      setLoading(false);
    }
  };

  // 메시지 내용 줄이기 (20자 이상이면 ...으로 표시)
  const truncateMessage = (text, maxLength = 20) => {
    if (!text) return "메시지를 확인하세요";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const handleChatClick = (chat) => {
    if (onChatClick) {
      onChatClick(chat);
    }
  };

  if (loading) {
    return (
      <div className={styles.root}>
        <div className={styles.header}>
          <h3 className={styles.title}>최근 채팅</h3>
        </div>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
        </div>
      </div>
    );
  }

  if (!recentChats || recentChats.length === 0) {
    return (
      <div className={styles.root}>
        <div className={styles.header}>
          <h3 className={styles.title}>최근 채팅</h3>
        </div>
        <div className={styles.emptyContainer}>
          <Icon icon="solar:chat-line-linear" className={styles.emptyIcon} />
          <p className={styles.emptyText}>최근 채팅이 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h3 className={styles.title}>최근 채팅</h3>
        <button className={styles.viewAllButton} onClick={onViewAll}>
          전체보기
        </button>
      </div>
      <div className={styles.chatList}>
        {recentChats.map((chat) => (
          <div
            key={chat.chatId}
            className={styles.chatItem}
            onClick={() => handleChatClick(chat)}
          >
            <div className={styles.chatInfo}>
              <div className={styles.chatHeader}>
                <span className={styles.userName}>
                  {chat.otherUser?.name || chat.otherUserName || `채팅방 #${chat.chatId}`}
                </span>
                {chat.unreadCount > 0 && (
                  <span className={styles.unreadBadge}>{chat.unreadCount}</span>
                )}
              </div>
              <p className={styles.lastMessage}>
                {truncateMessage(chat.lastMessage)}
              </p>
            </div>
            <Icon icon="solar:alt-arrow-right-linear" className={styles.arrowIcon} />
          </div>
        ))}
      </div>
    </div>
  );
}
