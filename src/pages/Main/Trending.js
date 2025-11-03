// src/pages/Main/Trending.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import styles from "../../styles/Main/Trending.module.css";
import { fetchPopularAuctions } from "../../api/auctions/service";

// 로컬 이미지(빈 결과/오류 대비 더미)
import chanelImg from "../../assets/img/Main/Trending/chanel.png";
import iphoneImg from "../../assets/img/Main/Trending/iphone15.png";
import nikeImg from "../../assets/img/Main/Trending/nike.png";
import rolexImg from "../../assets/img/Main/Trending/rolex.png";
import p5 from "../../assets/img/Main/Trending/p5.png";
import p6 from "../../assets/img/Main/Trending/p6.png";
import p7 from "../../assets/img/Main/Trending/p7.png";
import p8 from "../../assets/img/Main/Trending/p8.png";
import p9 from "../../assets/img/Main/Trending/p9.png";
import p10 from "../../assets/img/Main/Trending/p10.png";
import p11 from "../../assets/img/Main/Trending/p11.png";
import p12 from "../../assets/img/Main/Trending/p12.png";

/* ===== 시간 헬퍼 ===== */
const pad2 = (n) => String(n).padStart(2, "0");
/** diff(ms) → "D일 HH시간 MM분 SS초" (시간은 24로 나머지) */
function toDHMS(diffMs) {
  if (!Number.isFinite(diffMs) || diffMs <= 0) return "0일 00시간 00분 00초";
  const totalSec = Math.floor(diffMs / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${d}일 ${pad2(h)}시간 ${pad2(m)}분 ${pad2(s)}초`;
}

/** 1초 주기로 현재시각 갱신 */
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
 * - 서버: status=POPULAR, sort=BID_COUNT_DESC
 * - pageSize: 한 화면당 카드 개수(슬라이드 단위)
 */
export default function Trending({ pageSize = 4, onCardClick }) {
  const navigate = useNavigate();
  const nowTick = useNowTick();

  // 로컬 더미 (서버 무응답/빈 결과 대비)
  const fallback = useMemo(
    () => [
      { id: 1,  title: "아이폰 15 Pro Max 256GB - Silver", imageUrl: iphoneImg, currentBid: 1280000, bidders: 41 },
      { id: 2,  title: "롤렉스 서브마리너 데이트",           imageUrl: rolexImg,  currentBid: 5180000, bidders: 19 },
      { id: 3,  title: "나이키 에어포스 1 화이트",            imageUrl: nikeImg,   currentBid: 280000,  bidders: 23 },
      { id: 4,  title: "샤넬 플랩백 캐비어 레더",             imageUrl: chanelImg, currentBid: 3380000, bidders: 36 },
      { id: 5,  title: "Product5",  imageUrl: p5,  currentBid: 1190000, bidders: 17 },
      { id: 6,  title: "Product6",  imageUrl: p6,  currentBid: 4020000, bidders: 31 },
      { id: 7,  title: "Product7",  imageUrl: p7,  currentBid: 315000,  bidders: 29 },
      { id: 8,  title: "Product8",  imageUrl: p8,  currentBid: 2950000, bidders: 28 },
      { id: 9,  title: "Product9",  imageUrl: p9,  currentBid: 1250000, bidders: 38 },
      { id: 10, title: "Product10", imageUrl: p10, currentBid: 3800000, bidders: 22 },
      { id: 11, title: "Product11", imageUrl: p11, currentBid: 420000,  bidders: 54 },
      { id: 12, title: "Product12", imageUrl: p12, currentBid: 3200000, bidders: 42 },
    ],
    []
  );

  // 서버 데이터 상태
  const [items, setItems] = useState([]);   // [{ id,title,imageUrl,currentBid,bidders,endAtISO,timeLeftMs? }]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);     // 슬라이드 페이지(0-based)
  const [fetchedAt, setFetchedAt] = useState(Date.now()); // timeLeftMs 보정용 기준시각

  // API 호출
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // 인기 경매 12개(3페이지*4개)를 기본으로 요청
        const res = await fetchPopularAuctions({ page: 1, size: 12 });

        const rows = Array.isArray(res?.result?.items) ? res.result.items : [];
        // VM 변환: 서버 필드 이름 보정 + 종료시각/남은시간(ms) 추출
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
              // 백엔드가 남은 시간(ms)을 줄 수도 있음
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
    return () => {
      alive = false;
    };
  }, []);

  // 보여줄 소스(우선 서버, 없으면 fallback)
  const source = items.length ? items : fallback;

  // 남은 시간 계산(1초 갱신)
  const withTimeLeft = source.map((it) => {
    let diffMs = null;
    if (typeof it.timeLeftMs === "number") {
      // fetch 시점 이후 흐른 시간만큼 보정
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

        <ul className={styles.grid} role="list">
          {visible.map((it) => (
            <li key={it.id} className={styles.card}>
              <button
                type="button"
                className={styles.cardBody}
                onClick={() => goDetail(it.id, it)}
                aria-label={`${it.title} 상세로 이동`}
              >
                <img src={it.imageUrl} alt="" className={styles.thumb} />
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
