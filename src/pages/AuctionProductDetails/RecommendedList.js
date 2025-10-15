import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/AuctionProductDetails/RecommendedList.module.css";

export default function RecommendedList({ items }) {
  const navigate = useNavigate();

  const list = useMemo(() => {
    if (items && items.length > 0) return items;
    return Array.from({ length: 4 }).map((_, i) => ({
      id: `rec-${i + 1}`,
      title: `추천 상품 ${i + 1}`,
      price: 0,
    }));
  }, [items]);

  const formatPrice = (n) => {
    if (!n || n <= 0) return "-";
    try { return `₩${Number(n).toLocaleString()}`; }
    catch { return `₩${n}`; }
  };

  const onClickCard = (id) => {
    if (!id) return;
    navigate(`/auctions/${id}`);
  };

  return (
    <section className={styles.wrap} aria-label="추천 상품">
      <h3 className={styles.title}>추천 상품</h3>

      <div className={styles.grid}>
        {list.map((p) => (
          <article
            key={p.id}
            className={styles.card}
            role="button"
            tabIndex={0}
            aria-label={`${p.title} 상세로 이동`}
            onClick={() => onClickCard(p.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClickCard(p.id);
              }
            }}
          >
            <div className={styles.thumb}>
              {p.image ? (
                <img src={p.image} alt={p.title} loading="lazy" />
              ) : (
                <div className={styles.thumbFallback} aria-hidden="true" />
              )}
            </div>

            <h4 className={styles.name} title={p.title}>
              {p.title}
            </h4>

            <div className={styles.metaRow}>
              <span className={styles.price}>{formatPrice(p.price)}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
