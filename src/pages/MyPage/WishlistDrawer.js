import { useState } from "react";
import { Icon } from "@iconify/react";
import styles from "../../styles/MyPage/SellingDrawer.module.css";

export default function WishlistDrawer({ open, onClose, children, title = "찜한 목록", sortValue, onSortChange }) {
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className={`${styles.root} ${open ? styles.open : ""}`} aria-hidden={!open}>
      <div className={styles.backdrop} onClick={onClose} />
      <aside className={styles.panel} role="dialog" aria-modal="true" aria-label={title}>
        <header className={styles.header}>
          <button className={styles.close} onClick={onClose} aria-label="닫기">
            <Icon icon="solar:close-circle-linear" />
          </button>
          <h3 className={styles.title}>{title}</h3>
          <div className={styles.headerPlaceholder} />
        </header>

        <div className={styles.searchSection}>
          <div className={styles.searchBar}>
            <Icon icon="solar:magnifer-linear" className={styles.searchIcon} />
            <input
              type="text"
              placeholder="상품명 검색"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <select
            className={styles.filterBtn}
            value={sortValue}
            onChange={(e) => onSortChange?.(e.target.value)}
            style={{ padding: "8px 12px", cursor: "pointer" }}
          >
            <option value="deadline">마감임박순</option>
            <option value="price-high">높은가격순</option>
            <option value="price-low">낮은가격순</option>
            <option value="latest">최신순</option>
          </select>
        </div>

        <div className={styles.bodyWrapper}>
          <div className={styles.body}>{children}</div>
        </div>
      </aside>
    </div>
  );
}
