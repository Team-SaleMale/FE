import styles from "../../styles/AuctionList/Vertical.module.css";
import MyPageAuctionCard from "./MyPageAuctionCard";

export default function MyPageVertical({ items = [], onChatClick }) {
  return (
    <div className={styles.grid}>
      {items.map((it) => (
        <div key={it.id} className={styles.col}>
          <MyPageAuctionCard item={it} onChatClick={onChatClick} />
        </div>
      ))}
    </div>
  );
}
