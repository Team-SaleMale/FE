import styles from "../../styles/AuctionList/Horizontal.module.css";
import AuctionCardHorizontal from "./AuctionCardHorizontal";

export default function Horizontal({ items }) {
  return (
    <ul className={styles.list}>
      {items.map((it) => (
        <li key={it.id} className={styles.item}>
          <AuctionCardHorizontal item={it} />
        </li>
      ))}
    </ul>
  );
}
