import styles from "../../../styles/MyPage/SalesHistory/SalesHistoryList.module.css";
import WishlistCard from "./WishlistCard";

export default function WishlistList({ items = [], onItemClick, onRemoveWishlist }) {
  return (
    <div className={styles.list}>
      {items.length > 0 ? (
        items.map((it) => (
          <WishlistCard
            key={it.id}
            item={it}
            onClick={() => onItemClick?.(it)}
            onRemoveWishlist={() => onRemoveWishlist?.(it)}
          />
        ))
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
          찜한 상품이 없습니다.
        </div>
      )}
    </div>
  );
}
