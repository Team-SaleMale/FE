// src/pages/AuctionProductDetails/BidHistory.jsx
import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import styles from "../../styles/AuctionProductDetails/BidHistory.module.css";
import defaultProfile from "../../assets/img/AuctionProductDetails/ProfileImage/default_profile.jpg";

/**
 * props.items: [{ id, user, nickname, price, timeText, tag, avatarUrl }]
 *   - 표시명은 nickname → user → "익명" 순으로 결정
 *   - tag: "recent" | "min" | "max" | undefined
 * pageSize: number (default 6)
 * totalAuctionsText: string (우측 헤더 보조 텍스트)
 */
export default function BidHistory({ items = [], pageSize = 6, totalAuctionsText }) {
  const [page, setPage] = useState(1);

  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const TagBadge = ({ tag }) => {
    if (!tag) return null;
    const label = tag === "recent" ? "Recent" : tag === "min" ? "Min" : tag === "max" ? "Max" : tag;
    const cls =
      tag === "recent"
        ? styles.badgeRecent
        : tag === "min"
        ? styles.badgeMin
        : tag === "max"
        ? styles.badgeMax
        : styles.badge;
    return <span className={`${styles.badgeBase} ${cls}`}>{label}</span>;
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h3 className={styles.title}>Bid History</h3>
        <div className={styles.sub}>{totalAuctionsText ?? `${items.length.toLocaleString()} Auctions`}</div>
      </div>

      <ul className={styles.list}>
        {pageItems.map((b) => {
          const displayName = (b.nickname ?? b.user ?? "익명");
          const key = b.id ?? `${displayName}-${b.price}-${b.timeText}`;

          return (
            <li className={styles.row} key={key}>
              {/* Left: avatar + user */}
              <div className={styles.left}>
                <div className={styles.avatar}>
                  <img
                    src={b.avatarUrl || defaultProfile}
                    alt=""
                    onError={(e) => {
                      if (e.currentTarget.src !== defaultProfile) {
                        e.currentTarget.src = defaultProfile;
                      }
                    }}
                  />
                </div>
                <div className={styles.info}>
                  <div className={styles.user}>
                    <Icon icon="solar:camera-square-linear" className={styles.userIcon} aria-hidden />
                    {displayName}
                  </div>
                  <div className={styles.time}>입찰 시간: {b.timeText ?? "-"}</div>
                </div>
              </div>

              {/* Right: badge over price */}
              <div className={styles.right}>
                <TagBadge tag={b.tag} />
                <div className={styles.price}>₩{Number(b.price || 0).toLocaleString()}</div>
              </div>
            </li>
          );
        })}

        {!items.length && <li className={styles.empty}>아직 입찰 내역이 없습니다.</li>}
      </ul>

      {pages > 1 && (
        <div className={styles.pager} role="navigation" aria-label="Pagination">
          <button
            className={styles.arrow}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Previous page"
          >
            ‹
          </button>

          <div className={styles.pageDots}>
            {Array.from({ length: pages }).map((_, i) => {
              const n = i + 1;
              const isActive = n === page;
              return (
                <button
                  key={n}
                  className={`${styles.dot} ${isActive ? styles.dotActive : ""}`}
                  onClick={() => setPage(n)}
                  aria-current={isActive ? "page" : undefined}
                >
                  {n}
                </button>
              );
            })}
          </div>

          <button
            className={styles.arrow}
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            aria-label="Next page"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
