// src/pages/Main/Ending.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import styles from "../../styles/Main/Ending.module.css";
import { fetchEndingTodayAuctions } from "../../api/auctions/service";

import nintendoImg from "../../assets/img/Main/Trending/nintendo.png";

/* ===== 시간 유틸 ===== */
const to2 = (n) => String(n).padStart(2, "0");

/** HH:MM:SS 형태(오늘 마감만 다룬다고 가정) */
function timeLeftHMS(endAtISO, nowMs = Date.now()) {
  if (!endAtISO) return "00:00:00";
  const diff = new Date(endAtISO).getTime() - nowMs;
  if (diff <= 0) return "00:00:00";
  let sec = Math.floor(diff / 1000);
  const h = Math.floor(sec / 3600);
  sec -= h * 3600;
  const m = Math.floor(sec / 60);
  sec -= m * 60;
  return `${to2(h)}:${to2(m)}:${to2(sec)}`;
}

function ymdKST(dateLike) {
  const d = typeof dateLike === "string" ? new Date(dateLike) : dateLike;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function isEndingTodayKST(endISO, now = Date.now()) {
  if (!endISO) return false;
  return ymdKST(endISO) === ymdKST(now);
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
 * 오늘 마감 경매 섹션
 * - API 결과가 없으면 더미 사용
 * - 오늘(KST) 마감만 필터, 마감 임박(H<=1) 뱃지
 * - 페이지네이션: 4개
 * - 남은 시간 HH:MM:SS로 1초 업데이트
 */
export default function Ending({ pageSize = 4, onCardClick }) {
  const navigate = useNavigate();
  const nowTick = useNowTick();

  const [items, setItems] = useState([]);  // [{ id,title,imageUrl,currentBid,views,endAtISO }]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);

  // 더미 데이터(마운트 시각 기준 상대시간으로 endAtISO 생성)
  const fallback = useMemo(() => {
    const base = Date.now();
    const mk = (id, title, plusMin, bid, views) => ({
      id,
      title,
      imageUrl: nintendoImg,
      currentBid: bid,
      views,
      endAtISO: new Date(base + plusMin * 60 * 1000).toISOString(),
    });
    return [
      mk(101, "닌텐도 스위치 OLED (블루/레드)", 50, 420000, 160),
      mk(102, "닌텐도 스위치 OLED (화이트)",     80, 398000, 214),
      mk(103, "닌텐도 스위치 OLED (특전 포함)",   35, 452000, 131),
      mk(104, "닌텐도 스위치 OLED (미개봉)",     125, 485000, 187),
      mk(105, "닌텐도 OLED + 젤다 티어즈",       115, 512000, 221),
      mk(106, "닌텐도 OLED + 마리오카트",         45, 468000, 172),
      mk(107, "닌텐도 OLED 한정판",              190, 540000, 143),
      mk(108, "닌텐도 OLED (거치대 세트)",        25, 435000, 199),
    ];
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // 진행중 목록을 받아서 '오늘 마감'만 필터링
        const res = await fetchEndingTodayAuctions({ size: 60 });
        const rows = Array.isArray(res?.result?.items) ? res.result.items : [];

        const mapped = rows
          .map((it) => {
            const imgs = Array.isArray(it.imageUrls) ? it.imageUrls.filter(Boolean) : [];
            const thumb = imgs[0] || it.thumbnailUrl || it.imageUrl || "";
            return {
              id: it.itemId ?? it.id,
              title: it.title ?? "",
              imageUrl: thumb,
              currentBid: it.currentPrice ?? it.currentBid ?? it.price ?? 0,
              views: it.viewCount ?? it.views ?? 0,
              endAtISO: it.endTime ?? it.endAt ?? null,
            };
          })
          .filter((x) => x && x.id != null && x.endAtISO);

        let todayEnding = mapped
          .filter((x) => isEndingTodayKST(x.endAtISO))
          .sort((a, b) => new Date(a.endAtISO) - new Date(b.endAtISO));

        // API가 비어있거나 오늘 마감 항목이 없으면 더미 사용
        if (!todayEnding.length) {
          todayEnding = fallback
            .filter((x) => isEndingTodayKST(x.endAtISO))
            .sort((a, b) => new Date(a.endAtISO) - new Date(b.endAtISO));
        }

        if (!alive) return;
        setItems(todayEnding);
      } catch (e) {
        if (!alive) return;
        setError(e);
        // 오류 시에도 더미로 보여준다
        setItems(
          fallback
            .filter((x) => isEndingTodayKST(x.endAtISO))
            .sort((a, b) => new Date(a.endAtISO) - new Date(b.endAtISO))
        );
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [fallback]);

  // 남은 시간 실시간 갱신(HH:MM:SS)
  const withLeft = useMemo(
    () =>
      items.map((it) => ({
        ...it,
        timeLeft: timeLeftHMS(it.endAtISO, nowTick),
      })),
    [items, nowTick]
  );

  // 페이지네이션
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
    <section className={styles.endingSec} aria-label="오늘 마감 경매">
      <div className={styles.container}>
        <div className={styles.head}>
          <h2 className={styles.title}>오늘 마감 경매</h2>

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
          <div className={styles.state}>오류가 발생했습니다. 잠시 후 다시 시도해 주세요.</div>
        )}
        {!loading && !error && withLeft.length === 0 && (
          <div className={styles.state}>오늘 마감되는 경매가 없습니다.</div>
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
                          {"₩" + Number(it.currentBid ?? 0).toLocaleString("ko-KR")}
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
