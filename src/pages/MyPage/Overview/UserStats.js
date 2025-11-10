import { useEffect, useState } from "react";
import styles from "../../../styles/MyPage/Overview/UserStats.module.css";
import { chatService } from "../../../api/chat/service";

export default function UserStats({ mannerScore = 0, userId, onChatClick, onViewAllChats }) {
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

  return (
    <section className={styles.root}>
      <div className={styles.metricBlock}>
        <div className={styles.metricHeader}>경매지수</div>
        <div className={styles.metricScore}>{mannerScore} / 100</div>
        <div className={styles.metricBar}>
          <div className={styles.metricFill} style={{ width: `${mannerScore}%` }} />
        </div>
      </div>

      <div className={styles.rowCards}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>최근 후기</div>
          <div className={styles.cardLine}>⭐ "친절하고 빠른 거래였습니다! 다음에도..."</div>
          <div className={styles.cardLine}>⭐ "상품 상태가 설명과 정확히 일치해요 👍"</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardTitleWrapper}>
            <div className={styles.cardTitle}>최근 채팅</div>
            {recentChats.length > 0 && (
              <button className={styles.viewAllButton} onClick={onViewAllChats}>
                전체보기
              </button>
            )}
          </div>
          {loading ? (
            <div className={styles.cardLine}>로딩 중...</div>
          ) : recentChats.length === 0 ? (
            <div className={styles.cardLine}>최근 채팅이 없습니다</div>
          ) : (
            recentChats.map((chat) => (
              <div
                key={chat.chatId}
                className={styles.cardLine}
                onClick={() => handleChatClick(chat)}
                style={{ cursor: 'pointer' }}
              >
                💬 {chat.otherUser?.name || chat.otherUserName || `채팅방 #${chat.chatId}`}: "{truncateMessage(chat.lastMessage)}"
                {chat.unreadCount > 0 && (
                  <span className={styles.unreadBadge}>{chat.unreadCount}</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}


