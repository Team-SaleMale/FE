import styles from "../../../styles/MyPage/SalesHistory/SalesHistoryCard.module.css";
import { Icon } from "@iconify/react";

export default function SalesHistoryCard({ item, onClick, onChatClick }) {
  return (
    <article className={styles.card} onClick={onClick}>
      <div className={styles.thumbWrap}>
        {item?.image ? (
          <img className={styles.thumb} src={item.image} alt={item.title || "image"} />
        ) : (
          <div className={styles.thumbEmpty} />
        )}
      </div>
      <div className={styles.body}>
        <h4 className={styles.title}>{item?.title}</h4>
        <div className={styles.metaRow}>
          <span className={styles.label}>거래방식</span>
          <span className={styles.value}>{item?.tradeType || "직거래"}</span>
        </div>
        <div className={styles.metaRow}>
          <span className={styles.label}>낙찰가</span>
          <strong className={styles.price}>₩ {item?.finalPrice?.toLocaleString?.() || "-"}</strong>
        </div>
        <div className={styles.footer}>
          <div />
          <button className={styles.detailBtn} type="button" onClick={(e) => { e.stopPropagation(); onClick?.(item); }} aria-label="상품 상세보기">
            <Icon icon="solar:login-3-linear" />
          </button>
        </div>
      </div>
    </article>
  );
}










