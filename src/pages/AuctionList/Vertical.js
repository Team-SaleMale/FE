import styles from "../../styles/AuctionList/Vertical.module.css";
import AuctionCardVertical from "./AuctionCardVertical";

export default function Vertical({ items = [] }) {
  return (
    <div className={styles.grid}>
      {items.map((it) => (
        <div key={it.id} className={styles.col}>
          <AuctionCardVertical item={it} />
        </div>
      ))}
    </div>
  );
}
