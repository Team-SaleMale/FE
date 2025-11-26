import styles from "../../../styles/MyPage/PurchaseHistory/PurchaseHistoryCard.module.css";
import { Icon } from "@iconify/react";

export default function PurchaseHistoryCard({ item, onClick, onReviewClick }) {
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
          <span className={styles.label}>거래방식</span>
          <span className={styles.value}>{item?.tradeType || "직거래"}</span>
        </div>
        <div className={styles.metaRow}>
          <span className={styles.label}>낙찰가</span>
          <strong className={styles.price}>₩ {item?.finalPrice?.toLocaleString?.() || "-"}</strong>
        </div>
        <div className={styles.footer}>
          <button
            className={styles.reviewBtn}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onReviewClick?.(item);
            }}
            aria-label="후기 작성"
          >
            <Icon icon="solar:pen-new-square-linear" />
            후기 작성
          </button>
        </div>
      </div>
    </article>
  );
}
