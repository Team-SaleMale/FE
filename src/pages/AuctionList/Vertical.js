import styles from "../../styles/AuctionList/Vertical.module.css";
import AuctionCardVertical from "./AuctionCardVertical";
import { useNavigate } from "react-router-dom";

export default function Vertical({ items = [] }) {
  const navigate = useNavigate();
  return (
    <div className={styles.grid}>
      {items.map((it) => (
        <div
          key={it.id}
          className={styles.col}
          onClick={() => navigate(`/auctions/${it.id}`)} // ★ 상세 이동
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter") navigate(`/auctions/${it.id}`); }}
        >
          <AuctionCardVertical item={it} />
        </div>
      ))}
    </div>
  );
}
