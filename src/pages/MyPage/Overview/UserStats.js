import { useEffect, useState } from "react";
import styles from "../../../styles/MyPage/Overview/UserStats.module.css";
import { chatService } from "../../../api/chat/service";

export default function UserStats({ mannerScore = 0, userId, onChatClick, onViewAllChats }) {
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) fetchRecentChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchRecentChats = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await chatService.getChatList(userId, { page: 0, size: 2 });

      // ✅ 다양한 응답 포맷 방어
      const raw = response?.data ?? response;
      let list = [];

      if (Array.isArray(raw)) list = raw;
      else if (Array.isArray(raw?.items)) list = raw.items;
      else if (Array.isArray(raw?.result?.items)) list = raw.result.items;
      else if (Array.isArray(raw?.result)) list = raw.result;               // feature 브랜치형
      else if (Array.isArray(raw?.chats)) list = raw.chats;
      else if (raw && typeof raw === "object") list = [raw];

      setRecentChats(list.slice(0, 2));
      if (process.env.NODE_ENV !== "production") {
        console.log("최근 채팅(normalized):", list.slice(0, 2));
      }
    } catch (error) {
      console.error("최근 채팅 조회 실패:", error);
      setRecentChats([]);
    } finally {
      setLoading(false);
    }
  };

  // 메시지 20자 트렁케이트
  const truncateMessage = (text, maxLength = 20) => {
    if (!text) return "메시지를 확인하세요";
    return text.length <= maxLength ? text : text.substring(0, maxLength) + "...";
  };

  const handleChatClick = (chat) => onChatClick?.(chat);

  // 필드 호환 유틸
  const getPartnerName = (c) =>
    c?.partner?.nickname || c?.otherUser?.name || c?.otherUserName || `채팅방 #${c?.chatId ?? c?.id ?? "?"}`;

  const getLastMessageText = (c) =>
    c?.lastMessage?.content || c?.lastMessage || c?.lastMsg || c?.preview || "";

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
            recentChats.map((chat, idx) => (
              <div
                key={chat.chatId ?? chat.id ?? `chat-${idx}`}
                className={styles.cardLine}
                onClick={() => handleChatClick(chat)}
                style={{ cursor: "pointer" }}
              >
                💬 {getPartnerName(chat)}: "{truncateMessage(getLastMessageText(chat))}"
                {Number(chat.unreadCount) > 0 && (
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
