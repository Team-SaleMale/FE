import styles from "../../../styles/MyPage/SalesHistory/SalesHistoryList.module.css";
import SalesHistoryCard from "./SalesHistoryCard";

export default function SalesHistoryList({ items = [], onItemClick, onChatClick, onReviewClick }) {
  if (!items.length) {
    return (
      <div className={styles.empty}>
        <p>판매내역이 없습니다</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {items.map((it) => (
        <SalesHistoryCard
          key={it.id}
          item={it}
          onClick={() => onItemClick?.(it)}
          onChatClick={() => onChatClick?.(it)}
          onReviewClick={() => onReviewClick?.(it)}
        />
      ))}
    </div>
  );
}











