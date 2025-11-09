import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import styles from "../../styles/Main/Trending.module.css";
import { fetchPopularAuctions } from "../../api/auctions/service";

/* ===== 시간 헬퍼 ===== */
const pad2 = (n) => String(n).padStart(2, "0");
function toDHMS(diffMs) {
  if (!Number.isFinite(diffMs) || diffMs <= 0) return "0일 00시간 00분 00초";
  const totalSec = Math.floor(diffMs / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${d}일 ${pad2(h)}시간 ${pad2(m)}분 ${pad2(s)}초`;
}
function useNowTick() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

/**
 * 실시간 인기 경매
 * - /auctions?status=POPULAR&sort=BID_COUNT_DESC&page=0&size=12
 * - pageSize: 한 화면당 카드 개수(슬라이드 단위)
 */
export default function Trending({ pageSize = 4, onCardClick }) {
  const navigate = useNavigate();
  const nowTick = useNowTick();

  // 서버 데이터 상태 (기본값 없음)
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);           // 슬라이드 페이지(0-based)
  const [fetchedAt, setFetchedAt] = useState(Date.now()); // timeLeftMs 보정 기준

  // API 호출 (/auctions POPULAR 12개)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // 인기 경매 12개
        const res = await fetchPopularAuctions({ page: 1, size: 12 }); // status=POPULAR, sort=BID_COUNT_DESC
        const rows = Array.isArray(res?.result?.items) ? res.result.items : [];

        const mapped = rows
          .map((it) => {
            const imgs = Array.isArray(it.imageUrls) ? it.imageUrls.filter(Boolean) : [];
            const firstImg = imgs[0] || it.thumbnailUrl || it.imageUrl || "";
            return {
              id: it.itemId ?? it.id,
              title: it.title ?? "",
              imageUrl: firstImg,
              currentBid: it.currentPrice ?? it.currentBid ?? 0,
              bidders: it.bidderCount ?? it.bidders ?? 0,
              endAtISO: it.endTime ?? it.endAt ?? null,
              timeLeftMs:
                (typeof it.timeLeftMs === "number" && it.timeLeftMs >= 0 && it.timeLeftMs) ||
                (typeof it.remainingMs === "number" && it.remainingMs >= 0 && it.remainingMs) ||
                null,
            };
          })
          .filter((x) => x && x.id != null);

        if (!alive) return;
        setItems(mapped);
        setFetchedAt(Date.now());
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
  }, []);

  // 기본값 없는 소스
  const source = items;

  // 남은 시간 계산(1초 갱신)
  const withTimeLeft = source.map((it) => {
    let diffMs = null;
    if (typeof it.timeLeftMs === "number") {
      diffMs = it.timeLeftMs - (nowTick - fetchedAt);
    } else if (it.endAtISO) {
      const endMs = new Date(it.endAtISO).getTime();
      if (Number.isFinite(endMs)) diffMs = endMs - nowTick;
    }
    return { ...it, timeLeft: toDHMS(diffMs ?? -1) };
  });

  // 페이지네이션(슬라이드)
  const totalPages = Math.max(1, Math.ceil(withTimeLeft.length / pageSize));
  const isFirstPage = page === 0;
  const isLastPage = page >= totalPages - 1;
  const start = page * pageSize;
  const visible = withTimeLeft.slice(start, start + pageSize);

  const toPrev = () => !isFirstPage && setPage((p) => p - 1);
  const toNext = () => !isLastPage && setPage((p) => p + 1);

  const goDetail = (id, item) => {
    if (typeof onCardClick === "function") return onCardClick(item);
    navigate(`/auctions/${id}`);
  };

  const formatWon = (n) => "₩" + Number(n ?? 0).toLocaleString("ko-KR");

  return (
    <section className={styles.trendingSec} aria-label="실시간 인기 경매">
      <div className={styles.container}>
        <div className={styles.head}>
          <h2 className={styles.title}>실시간 인기 경매</h2>

          <div className={styles.navBtns}>
            <button
              className={styles.navBtn}
              onClick={toPrev}
              aria-label="이전 인기 경매"
              aria-disabled={isFirstPage}
              disabled={isFirstPage}
              tabIndex={isFirstPage ? -1 : 0}
            >
              <Icon icon="solar:alt-arrow-left-linear" />
            </button>
            <button
              className={styles.navBtn}
              onClick={toNext}
              aria-label="다음 인기 경매"
              aria-disabled={isLastPage}
              disabled={isLastPage}
              tabIndex={isLastPage ? -1 : 0}
            >
              <Icon icon="solar:alt-arrow-right-linear" />
            </button>
          </div>
        </div>

        {/* 상태 표시 */}
        {loading && <div className={styles.state}>불러오는 중…</div>}
        {!loading && error && (
          <div className={styles.state}>오류가 발생했습니다. 잠시 후 다시 시도해 주세요.</div>
        )}
        {!loading && !error && source.length === 0 && (
          <div className={styles.state}>표시할 인기 경매가 없습니다.</div>
        )}

        <ul className={styles.grid} role="list">
          {visible.map((it) => (
            <li key={it.id} className={styles.card}>
              <button
                type="button"
                className={styles.cardBody}
                onClick={() => goDetail(it.id, it)}
                aria-label={`${it.title} 상세로 이동`}
              >
                {it.imageUrl ? (
                  <img src={it.imageUrl} alt="" className={styles.thumb} />
                ) : (
                  <div className={styles.thumb} aria-hidden="true" />
                )}
                <span className={styles.overlay} />
                <div className={styles.textWrap}>
                  <div className={styles.titles}>
                    <h3 className={styles.cardTitle}>{it.title}</h3>
                  </div>

                  <div className={styles.meta}>
                    <p className={styles.row}>
                      <span className={styles.dim}>현재 입찰가</span>{" "}
                      <strong className={styles.price}>{formatWon(it.currentBid)}</strong>
                    </p>
                    <p className={styles.row}>
                      <span className={styles.dim}>남은 시간</span>{" "}
                      <span className={styles.white}>{it.timeLeft}</span>
                    </p>
                    <p className={styles.row}>
                      <span className={styles.dim}>입찰 현황</span>{" "}
                      <span className={styles.white}>
                        {Number(it.bidders ?? 0).toLocaleString()}명 입찰 중
                      </span>
                    </p>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
