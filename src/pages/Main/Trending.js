import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import styles from "../../styles/Main/Trending.module.css";

import chanelImg from "../../assets/img/Main/Trending/chanel.png";
import iphoneImg from "../../assets/img/Main/Trending/iphone15.png";
import nikeImg from "../../assets/img/Main/Trending/nike.png";
import rolexImg from "../../assets/img/Main/Trending/rolex.png";
import p5 from "../../assets/img/Main/Trending/p5.png"
import p6 from "../../assets/img/Main/Trending/p6.png"
import p7 from "../../assets/img/Main/Trending/p7.png"
import p8 from "../../assets/img/Main/Trending/p8.png"
import p9 from "../../assets/img/Main/Trending/p9.png"
import p10 from "../../assets/img/Main/Trending/p10.png"
import p11 from "../../assets/img/Main/Trending/p11.png"
import p12 from "../../assets/img/Main/Trending/p12.png"


/**
 * 권장 서버 응답:
 * [{ id, title, imageUrl, currentBid, timeLeft, bidders }]
 */
export default function Trending({ data, pageSize = 4, onCardClick }) {
  const navigate = useNavigate();

  const fallback = useMemo(
    () => [
      { id: 1,  title: "아이폰 15 Pro Max 256GB - Silver", imageUrl: iphoneImg, currentBid: 1280000, timeLeft: "1시간 45분", bidders: 41 },
      { id: 2,  title: "롤렉스 서브마리너 데이트",           imageUrl: rolexImg,  currentBid: 5180000, timeLeft: "8시간 10분", bidders: 19 },
      { id: 3,  title: "나이키 에어포스 1 화이트",            imageUrl: nikeImg,   currentBid: 280000,  timeLeft: "35분",       bidders: 23 },
      { id: 4,  title: "샤넬 플랩백 캐비어 레더",             imageUrl: chanelImg, currentBid: 3380000, timeLeft: "3시간 55분", bidders: 36 },
      { id: 5,  title: "Product5",     imageUrl:p5, currentBid: 1190000, timeLeft: "3시간 12분", bidders: 17 },
      { id: 6,  title: "Product6",        imageUrl: p6,  currentBid: 4020000, timeLeft: "6시간 05분", bidders: 31 },
      { id: 7,  title: "Product7",             imageUrl: p7,   currentBid: 315000,  timeLeft: "55분",       bidders: 29 },
      { id: 8,  title: "Product8",           imageUrl: p8, currentBid: 2950000, timeLeft: "2시간 02분", bidders: 28 },
      { id: 9,  title: "Product9",             imageUrl: p9, currentBid: 1250000, timeLeft: "2시간 15분", bidders: 38 },
      { id: 10, title: "Product10",                  imageUrl: p10,  currentBid: 3800000, timeLeft: "5시간 40분", bidders: 22 },
      { id: 11, title: "Product11",             imageUrl: p11,   currentBid: 420000,  timeLeft: "1시간 5분",  bidders: 54 },
      { id: 12, title: "Product12",   imageUrl: p12, currentBid: 3200000, timeLeft: "1시간 20분", bidders: 42 },
    ],
    []
  );

  const normalizeItem = (raw) => ({
    id: raw?.id ?? raw?.auctionId ?? raw?.productId,
    title: raw?.title ?? raw?.name ?? "",
    imageUrl: raw?.imageUrl ?? raw?.img ?? raw?.image ?? "",
    currentBid: raw?.currentBid ?? raw?.bid ?? raw?.price ?? 0,
    timeLeft: raw?.timeLeft ?? raw?.left ?? "",
    bidders: raw?.bidders ?? raw?.bidderCount ?? 0,
  });

  const source = Array.isArray(data) && data.length > 0 ? data : fallback;
  const items = source.map(normalizeItem).filter((x) => x && x.id != null);

  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(items.length / pageSize) || 1;
  const isFirstPage = page === 0;
  const isLastPage = page >= totalPages - 1;

  const start = page * pageSize;
  const visible = items.slice(start, start + pageSize);

  const toPrev = () => !isFirstPage && setPage((p) => p - 1);
  const toNext = () => !isLastPage && setPage((p) => p + 1);

  const goDetail = (id, item) => {
    if (typeof onCardClick === "function") return onCardClick(item);
    navigate(`/auctions/${id}`);
  };

  const formatWon = (n) => "₩" + Number(n ?? 0).toLocaleString("ko-KR");

  return (
    <section className={styles.trendingSec} aria-label="실시간 인기 경매">
      {/* 자체 컨테이너: 히어로 아래에서 스스로 너비/여백을 관리 */}
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
                      <span className={styles.white}>{it.bidders}명 입찰 중</span>
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
