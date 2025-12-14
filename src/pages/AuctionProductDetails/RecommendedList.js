// src/pages/AuctionProductDetails/RecommendedList.js
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/AuctionProductDetails/RecommendedList.module.css";
import { fetchAuctionList } from "../../api/auctions/service";

/** API/내부 데이터를 카드에서 쓰기 편한 형태로 정규화 */
function normalizeItem(raw) {
  if (!raw) return null;

  const id = raw.id ?? raw.itemId;
  const title = raw.title || raw.name || "상품";
  const price =
    typeof raw.price === "number"
      ? raw.price
      : raw.currentPrice ??
        (raw.price && (raw.price.current ?? raw.price.start)) ??
        raw.startPrice ??
        0;

  const image =
    raw.image ??
    raw.thumbnail ??
    raw.thumbnailUrl ??
    (Array.isArray(raw.imageUrls) && raw.imageUrls.length > 0 ? raw.imageUrls[0] : "");

  return { id, title, price, image };
}

export default function RecommendedList({ items, size = 4 }) {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // 추천 상품 로딩
  useEffect(() => {
    let cancelled = false;

    // 1) 부모에서 넘어온 items가 있으면 그대로 사용 (API 호출 안 함)
    if (Array.isArray(items) && items.length > 0) {
      const normalized = items
        .map(normalizeItem)
        .filter(Boolean)
        .slice(0, size);
      setData(normalized);
      return () => {
        cancelled = true;
      };
    }

    // 2) props가 비어 있으면 /search/items 호출
    async function load() {
      setLoading(true);
      try {
        const res = await fetchAuctionList({
          status: "RECOMMENDED",
          radius: "ALL", // ✅ 요구사항: radius=ALL
          page: 1,
          size,
        });

        if (cancelled) return;

        const arr = res?.result?.items || [];
        const normalized = arr.map(normalizeItem).filter(Boolean);
        setData(normalized);
      } catch (e) {
        if (!cancelled) {
          console.error("Failed to load recommended items", e);
          setData([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [items, size]);

  const list = useMemo(() => {
    if (data && data.length > 0) return data;

    // API 로딩 중이거나 실패했을 때의 더미 카드
    return Array.from({ length: size }).map((_, i) => ({
      id: `rec-${i + 1}`,
      title: loading ? "" : `추천 상품 ${i + 1}`,
      price: 0,
      image: "",
      _placeholder: true,
    }));
  }, [data, size, loading]);

  const formatPrice = (n) => {
    const num = Number(n);
    if (!Number.isFinite(num) || num <= 0) return "-";
    try {
      return `₩${num.toLocaleString("ko-KR")}`;
    } catch {
      return `₩${num}`;
    }
  };

  const onClickCard = (id, isPlaceholder) => {
    if (!id || isPlaceholder) return; // 더미 카드는 클릭해도 이동 안 함
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
            role={p._placeholder ? "presentation" : "button"}
            tabIndex={p._placeholder ? -1 : 0}
            aria-label={p._placeholder ? undefined : `${p.title} 상세로 이동`}
            onClick={() => onClickCard(p.id, p._placeholder)}
            onKeyDown={(e) => {
              if (p._placeholder) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClickCard(p.id, false);
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
              {p.title || (loading ? " " : "추천 상품")}
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
