// src/pages/Main/Ending.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import styles from "../../styles/Main/Ending.module.css";
// ✅ 메인 전용: radius=ALL 강제 함수로 교체
import { fetchEndingSoonAuctionsForMain } from "../../api/auctions/service";

/* ===== 시간 유틸 ===== */
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
 * 마감 임박 경매
 * - /search/items?status=BIDDING&sort=END_TIME_ASC&page=0&size=12&radius=ALL
 */
export default function Ending({ pageSize = 4, onCardClick }) {
  const navigate = useNavigate();
  const nowTick = useNowTick();

  const [items, setItems] = useState([]); // [{ id,title,imageUrl,currentBid,views,endAtISO }]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [fetchedAt, setFetchedAt] = useState(Date.now());

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ 메인 전용: radius=ALL 고정
        const res = await fetchEndingSoonAuctionsForMain({ size: 12 });
        const rows = Array.isArray(res?.result?.items) ? res.result.items : [];

        const mapped = rows
          .map((it) => {
            const imgs = Array.isArray(it.imageUrls)
              ? it.imageUrls.filter(Boolean)
              : [];
            const thumb = imgs[0] || it.thumbnailUrl || it.imageUrl || "";
            return {
              id: it.itemId ?? it.id,
              title: it.title ?? "",
              imageUrl: thumb,
              currentBid: it.currentPrice ?? it.currentBid ?? it.price ?? 0,
              views: it.viewCount ?? it.views ?? 0,
              endAtISO: it.endTime ?? it.endAt ?? null,
              timeLeftMs:
                (typeof it.timeLeftMs === "number" &&
                  it.timeLeftMs >= 0 &&
                  it.timeLeftMs) ||
                (typeof it.remainingMs === "number" &&
                  it.remainingMs >= 0 &&
                  it.remainingMs) ||
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
    return () => {
      alive = false;
    };
  }, []);

  // 남은 시간 (1초 갱신)
  const withLeft = useMemo(
    () =>
      items.map((it) => {
        let diffMs = null;
        if (typeof it.timeLeftMs === "number") {
          diffMs = it.timeLeftMs - (nowTick - fetchedAt);
        } else if (it.endAtISO) {
          const endMs = new Date(it.endAtISO).getTime();
          if (Number.isFinite(endMs)) diffMs = endMs - nowTick;
        }
        return { ...it, timeLeft: toDHMS(diffMs ?? -1) };
      }),
    [items, nowTick, fetchedAt]
  );

  // 페이지네이션(슬라이드)
  const totalPages = Math.max(1, Math.ceil(withLeft.length / pageSize));
  const start = page * pageSize;
  const visible = withLeft.slice(start, start + pageSize);

  const toPrev = () => page > 0 && setPage((p) => p - 1);
  const toNext = () => page < totalPages - 1 && setPage((p) => p + 1);

  const goDetail = (id, item) => {
    if (typeof onCardClick === "function") return onCardClick(item);
    navigate(`/auctions/${id}`);
  };

  // 60분 이내 마감 배지
  const isUrgent = (endAtISO) => {
    if (!endAtISO) return false;
    const diffMin = (new Date(endAtISO).getTime() - nowTick) / 60000;
    return diffMin > 0 && diffMin <= 60;
  };

  return (
    <section className={styles.endingSec} aria-label="마감 임박 경매">
      <div className={styles.container}>
        <div className={styles.head}>
          <h2 className={styles.title}>마감 임박 경매</h2>

          {withLeft.length > 0 && (
            <div className={styles.navBtns}>
              <button
                className={styles.navBtn}
                onClick={toPrev}
                aria-label="이전 페이지"
                aria-disabled={page === 0}
                disabled={page === 0}
                tabIndex={page === 0 ? -1 : 0}
              >
                <Icon icon="solar:alt-arrow-left-linear" />
              </button>
              <button
                className={styles.navBtn}
                onClick={toNext}
                aria-label="다음 페이지"
                aria-disabled={page >= totalPages - 1}
                disabled={page >= totalPages - 1}
                tabIndex={page >= totalPages - 1 ? -1 : 0}
              >
                <Icon icon="solar:alt-arrow-right-linear" />
              </button>
            </div>
          )}
        </div>

        {/* 상태 표시 */}
        {loading && <div className={styles.state}>불러오는 중…</div>}
        {!loading && error && withLeft.length === 0 && (
          <div className={styles.state}>
            오류가 발생했습니다. 잠시 후 다시 시도해 주세요.
          </div>
        )}
        {!loading && !error && withLeft.length === 0 && (
          <div className={styles.state}>표시할 마감 임박 경매가 없습니다.</div>
        )}

        {!loading && withLeft.length > 0 && (
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
                    {it.imageUrl ? (
                      <img src={it.imageUrl} alt="" className={styles.thumb} />
                    ) : (
                      <div className={styles.thumbPlaceholder} />
                    )}
                  </div>

                  <div className={styles.body}>
                    <p className={styles.views}>
                      <span className={styles.viewsNum}>
                        {Number(it.views).toLocaleString()}
                      </span>{" "}
                      views
                    </p>

                    <h3 className={styles.cardTitle}>{it.title}</h3>

                    <div className={styles.rows}>
                      <p className={styles.leftTime}>
                        남은 시간: <strong>{it.timeLeft}</strong>
                      </p>
                      {isUrgent(it.endAtISO) && (
                        <span className={styles.badge}>마감 임박</span>
                      )}
                    </div>

                    <div className={styles.footer}>
                      <div className={styles.priceWrap}>
                        <span className={styles.dim}>현재 입찰가</span>
                        <strong className={styles.price}>
                          {"₩" +
                            Number(it.currentBid ?? 0).toLocaleString("ko-KR")}
                        </strong>
                      </div>
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
