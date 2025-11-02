// src/pages/AuctionList/Pagination.jsx
import styles from "../../styles/AuctionList/Pagination.module.css";

function buildPages(cur, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = [];
  const push = (v) => pages.push(v);

  push(1); // 항상 1

  const left = Math.max(2, cur - 1);
  const right = Math.min(total - 1, cur + 1);

  if (left > 2) push("...");
  for (let p = left; p <= right; p++) push(p);
  if (right < total - 1) push("...");

  push(total); // 항상 끝
  return pages;
}

export default function Pagination({ page, totalPages, onChange }) {
  const pages = buildPages(page, totalPages);

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const go = (next) => {
    onChange(next);
    scrollToTop();
  };

  return (
    <nav className={styles.nav} aria-label="pagination">
      <button
        className={styles.arrow}
        disabled={page === 1}
        aria-label="Previous page"
        onClick={() => go(Math.max(1, page - 1))}
      >
        ‹
      </button>

      <ul className={styles.pages}>
        {pages.map((p, i) =>
          typeof p === "number" ? (
            <li key={i}>
              <button
                className={`${styles.pageBtn} ${p === page ? styles.active : ""}`}
                aria-current={p === page ? "page" : undefined}
                onClick={() => go(p)}
              >
                {p}
              </button>
            </li>
          ) : (
            <li key={i} className={styles.ellipsis} aria-hidden="true">
              …
            </li>
          )
        )}
      </ul>

      <button
        className={styles.arrow}
        disabled={page === totalPages}
        aria-label="Next page"
        onClick={() => go(Math.min(totalPages, page + 1))}
      >
        ›
      </button>
    </nav>
  );
}
