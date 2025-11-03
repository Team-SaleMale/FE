import styles from "../../styles/AuctionList/Horizontal.module.css";
import AuctionCardHorizontal from "./AuctionCardHorizontal";
import { useNavigate } from "react-router-dom";

export default function Horizontal({ items = [] }) {
  const navigate = useNavigate();
  return (
    <ul className={styles.list}>
      {items.map((it) => (
        <li
          key={it.id}
          className={styles.item}
          onClick={() => navigate(`/auctions/${it.id}`)} // ★ 상세로 이동
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter") navigate(`/auctions/${it.id}`); }}
        >
          <AuctionCardHorizontal item={it} />
        </li>
      ))}
    </ul>
  );
}
