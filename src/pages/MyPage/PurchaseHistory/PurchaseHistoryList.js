import styles from "../../../styles/MyPage/PurchaseHistory/PurchaseHistoryList.module.css";
import PurchaseHistoryCard from "./PurchaseHistoryCard";

export default function PurchaseHistoryList({ items = [], onItemClick }) {
  if (!items.length) {
    return (
      <div className={styles.empty}>
        <p>구매내역이 없습니다</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {items.map((item) => (
        <PurchaseHistoryCard
          key={item.id}
          item={item}
          onClick={() => onItemClick?.(item)}
        />
      ))}
    </div>
  );
}
