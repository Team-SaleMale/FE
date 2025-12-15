import styles from "../../../styles/MyPage/SalesHistory/SalesHistoryCard.module.css";
import { Icon } from "@iconify/react";

export default function WishlistCard({ item, onClick, onRemoveWishlist }) {
  return (
    <article className={styles.card}>
      <div className={styles.thumbWrap} onClick={onClick}>
        {item?.image ? (
          <img className={styles.thumb} src={item.image} alt={item.title || "image"} />
        ) : (
          <div className={styles.thumbEmpty} />
        )}
      </div>
      <div className={styles.body}>
        <h4 className={styles.title} onClick={onClick}>{item?.title}</h4>
        <div className={styles.metaRow}>
          <span className={styles.label}>시작가</span>
          <span className={styles.value}>₩ {item?.startPrice?.toLocaleString?.() || "-"}</span>
        </div>
        <div className={styles.metaRow}>
          <span className={styles.label}>현재 입찰가</span>
          <strong className={styles.price}>₩ {item?.currentPrice?.toLocaleString?.() || "-"}</strong>
        </div>
        <div className={styles.metaRow}>
          <span className={styles.label}>남은시간</span>
          <span className={styles.value} style={{ color: item?.timeLeft?.startsWith('0') ? '#ff6b6b' : 'inherit' }}>
            {item?.timeLeft || "-"}
          </span>
        </div>
        <div className={styles.metaRow}>
          <span className={styles.label}>입찰자</span>
          <span className={styles.value}>{item?.bidders || 0}명</span>
        </div>
        <div className={styles.footer}>
          <button
            className={styles.detailBtn}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveWishlist?.(item);
            }}
            aria-label="찜 해제"
            style={{ color: '#ff4757' }}
          >
            <Icon icon="solar:heart-bold" />
          </button>
        </div>
      </div>
    </article>
  );
}
