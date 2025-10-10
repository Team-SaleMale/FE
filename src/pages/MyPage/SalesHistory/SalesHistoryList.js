import styles from "../../../styles/MyPage/SalesHistory/SalesHistoryList.module.css";
import SalesHistoryCard from "./SalesHistoryCard";

export default function SalesHistoryList({ items = [], onItemClick, onChatClick }) {
  return (
    <div className={styles.list}>
      {items.map((it) => (
        <SalesHistoryCard
          key={it.id}
          item={it}
          onClick={() => onItemClick?.(it)}
          onChatClick={() => onChatClick?.(it)}
        />
      ))}
    </div>
  );
}


