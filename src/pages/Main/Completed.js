// src/pages/Main/Completed.jsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import styles from "../../styles/Main/Completed.module.css";
import { fetchCompletedAuctions } from "../../api/auctions/service";

/** 가격 포맷 */
const formatWon = (n) => "₩" + Number(n ?? 0).toLocaleString("ko-KR");

/** 서버 → 뷰모델 매핑 */
function mapRow(it) {
  const imgs = Array.isArray(it.imageUrls) ? it.imageUrls.filter(Boolean) : [];
  const firstImg = imgs[0] || it.thumbnailUrl || it.imageUrl || "";
  return {
    id: it.itemId ?? it.id,
    title: it.title ?? "",
    category: it.categoryName ?? it.category ?? "",
    imageUrl: firstImg,
    finalPrice: it.finalPrice ?? it.winningBidPrice ?? it.currentPrice ?? 0,
    views: it.viewCount ?? it.views ?? 0,
  };
}

/**
 * 입찰 완료된 상품
 * - 백엔드 /auctions?status=COMPLETED 기반
 * - 내부 슬라이더 페이지네이션(pageSize=4)
 * - 더미 데이터 없음(빈 결과/오류 시 안내)
 */
export default function Completed({ pageSize = 4, onCardClick, size = 12, sort }) {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);         // 전체 결과(최대 size개)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(0);           // 슬라이드 페이지
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const start = page * pageSize;
  const visible = items.slice(start, start + pageSize);

  const isFirst = page === 0;
  const isLast = page >= totalPages - 1;

  const toPrev = () => !isFirst && setPage((p) => p - 1);
  const toNext = () => !isLast && setPage((p) => p + 1);

  const goDetail = (id, item) => {
    if (typeof onCardClick === "function") return onCardClick(item);
    navigate(`/auctions/${id}`);
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // 완료된 경매 최대 size개 요청 (예: 12개)
        const res = await fetchCompletedAuctions({ page: 1, size, sort });
        const rows = Array.isArray(res?.result?.items) ? res.result.items : [];
        const mapped = rows.map(mapRow).filter((x) => x && x.id != null);

        if (!alive) return;
        setItems(mapped);
        setPage(0); // 데이터 새로고침 시 첫 페이지로
      } catch (e) {
        if (!alive) return;
        setError(e);
        setItems([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [size, sort]);

  const stateMsg = useMemo(() => {
    if (loading) return "불러오는 중…";
    if (error) return "오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
    if (!items.length) return "표시할 완료된 경매가 없습니다.";
    return null;
  }, [loading, error, items.length]);

  return (
    <section className={styles.completedSec} aria-label="입찰 완료된 상품">
      <div className={styles.container}>
        <div className={styles.head}>
          <h2 className={styles.title}>입찰 완료된 상품</h2>
          <div className={styles.navBtns}>
            <button
              className={styles.navBtn}
              onClick={toPrev}
              aria-label="이전 페이지"
              aria-disabled={isFirst}
              disabled={isFirst}
              tabIndex={isFirst ? -1 : 0}
            >
              <Icon icon="solar:alt-arrow-left-linear" />
            </button>
            <button
              className={styles.navBtn}
              onClick={toNext}
              aria-label="다음 페이지"
              aria-disabled={isLast}
              disabled={isLast}
              tabIndex={isLast ? -1 : 0}
            >
              <Icon icon="solar:alt-arrow-right-linear" />
            </button>
          </div>
        </div>

        {stateMsg ? (
          <div className={styles.state}>{stateMsg}</div>
        ) : (
          <ul className={styles.grid} role="list">
            {visible.map((it) => (
              <li key={it.id} className={styles.card}>
                <button
                  type="button"
                  className={styles.cardInner}
                  onClick={() => goDetail(it.id, it)}
                  aria-label={`${it.title} 상세로 이동`}
                >
                  <div className={styles.thumbWrap}>
                    {/* alt는 시각장애인 사용자 배려: 제목 사용 */}
                    <img src={it.imageUrl} alt={it.title || "완료된 경매"} className={styles.thumb} />
                  </div>

                  <div className={styles.body}>
                    <p className={styles.views}>
                      <span className={styles.viewsNum}>
                        {Number(it.views).toLocaleString()}
                      </span>{" "}
                      views
                    </p>

                    <h3 className={styles.cardTitle} title={it.title}>{it.title}</h3>

                    {!!it.category && (
                      <p className={styles.category}>{it.category}</p>
                    )}

                    <div className={styles.footer}>
                      <span className={styles.dim}>낙찰가</span>
                      <strong className={styles.price}>{formatWon(it.finalPrice)}</strong>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
