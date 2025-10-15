import { useState } from "react";
import { Icon } from "@iconify/react";
import styles from "../../styles/MyPage/PurchaseDrawer.module.css";
import DetailFilter from "./DetailFilter";

export default function PurchaseDrawer({ open, onClose, children, title = "구매내역" }) {
  const [searchValue, setSearchValue] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterData, setFilterData] = useState({ period: "최근 1년" });

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
          <button className={styles.filterBtn} onClick={() => setFilterOpen(!filterOpen)}>
            <Icon icon="solar:tuning-2-linear" />
            <span>상세필터</span>
          </button>
        </div>

        <div className={styles.bodyWrapper}>
          <div className={styles.body}>{children}</div>

          <DetailFilter
            open={filterOpen}
            onClose={() => setFilterOpen(false)}
            onApply={(data) => {
              setFilterData(data);
              console.log("Filter applied:", data);
            }}
          />
        </div>
      </aside>
    </div>
  );
}
