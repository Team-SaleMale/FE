import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import styles from "../../styles/Main/Ending.module.css";

import nintendoImg from "../../assets/img/Main/Trending/nintendo.png";

/**
 * 오늘 마감 경매 섹션
 * - 페이지네이션: 4개씩
 * - 데이터 형식(권장): [{ id, title, imageUrl, currentBid, timeLeft, views }]
 * - props.data 없으면 내부 더미 사용
 */
export default function Ending({ data, pageSize = 4, onCardClick }) {
  const navigate = useNavigate();

  // 더미 데이터 (제목/시간/가격 서로 다르게)
  const fallback = useMemo(
    () => [
      { id: 101, title: "닌텐도 스위치 OLED (블루/레드)", imageUrl: nintendoImg, currentBid: 420000, timeLeft: "50분",      views: 160 },
      { id: 102, title: "닌텐도 스위치 OLED (화이트)",     imageUrl: nintendoImg, currentBid: 398000, timeLeft: "1시간 20분", views: 214 },
      { id: 103, title: "닌텐도 스위치 OLED (특전 포함)",   imageUrl: nintendoImg, currentBid: 452000, timeLeft: "35분",      views: 131 },
      { id: 104, title: "닌텐도 스위치 OLED (미개봉)",       imageUrl: nintendoImg, currentBid: 485000, timeLeft: "2시간 5분",  views: 187 },
      { id: 105, title: "닌텐도 OLED + 젤다 티어즈",         imageUrl: nintendoImg, currentBid: 512000, timeLeft: "1시간 55분", views: 221 },
      { id: 106, title: "닌텐도 OLED + 마리오카트",          imageUrl: nintendoImg, currentBid: 468000, timeLeft: "45분",      views: 172 },
      { id: 107, title: "닌텐도 OLED 한정판",               imageUrl: nintendoImg, currentBid: 540000, timeLeft: "3시간 10분", views: 143 },
      { id: 108, title: "닌텐도 OLED (거치대 세트)",         imageUrl: nintendoImg, currentBid: 435000, timeLeft: "25분",      views: 199 },
      { id: 109, title: "닌텐도 OLED (패드 새것)",           imageUrl: nintendoImg, currentBid: 478000, timeLeft: "1시간 05분", views: 132 },
      { id: 110, title: "닌텐도 OLED (보증 남음)",           imageUrl: nintendoImg, currentBid: 499000, timeLeft: "2시간 40분", views: 118 },
      { id: 111, title: "닌텐도 OLED + 케이스 풀세트",       imageUrl: nintendoImg, currentBid: 455000, timeLeft: "55분",      views: 176 },
      { id: 112, title: "닌텐도 OLED (생활흔적 약간)",       imageUrl: nintendoImg, currentBid: 388000, timeLeft: "4시간 15분", views: 97  },
      { id: 113, title: "닌텐도 OLED 한정판",               imageUrl: nintendoImg, currentBid: 540000, timeLeft: "3시간 10분", views: 143 },
      { id: 114, title: "닌텐도 OLED (거치대 세트)",         imageUrl: nintendoImg, currentBid: 435000, timeLeft: "25분",      views: 199 },
      { id: 115, title: "닌텐도 OLED (패드 새것)",           imageUrl: nintendoImg, currentBid: 478000, timeLeft: "1시간 05분", views: 132 },
      { id: 116, title: "닌텐도 OLED (보증 남음)",           imageUrl: nintendoImg, currentBid: 499000, timeLeft: "2시간 40분", views: 118 },
      { id: 117, title: "닌텐도 OLED + 케이스 풀세트",       imageUrl: nintendoImg, currentBid: 455000, timeLeft: "55분",      views: 176 },
      { id: 118, title: "닌텐도 OLED (생활흔적 약간)",       imageUrl: nintendoImg, currentBid: 388000, timeLeft: "4시간 15분", views: 97  },
    ],
    []
  );

  const source = Array.isArray(data) && data.length ? data : fallback;

  // 키 이름 방어
  const items = source
    .map((raw) => ({
      id: raw?.id ?? raw?.auctionId ?? raw?.productId,
      title: raw?.title ?? raw?.name ?? "",
      imageUrl: raw?.imageUrl ?? raw?.img ?? raw?.image ?? nintendoImg,
      currentBid: raw?.currentBid ?? raw?.bid ?? raw?.price ?? 0,
      timeLeft: raw?.timeLeft ?? raw?.left ?? "",
      views: raw?.views ?? raw?.viewCount ?? 0,
    }))
    .filter((x) => x && x.id != null);

  // 페이지네이션
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const start = page * pageSize;
  const visible = items.slice(start, start + pageSize);

  const toPrev = () => page > 0 && setPage((p) => p - 1);
  const toNext = () => page < totalPages - 1 && setPage((p) => p + 1);

  const goDetail = (id, item) => {
    if (typeof onCardClick === "function") return onCardClick(item);
    navigate(`/auctions/${id}`);
  };

  const formatWon = (n) => "₩" + Number(n ?? 0).toLocaleString("ko-KR");

  // '마감 임박' 표시: 분 단위 or 1시간 이내
  const isUrgent = (left) => {
    if (!left) return false;
    if (/(\d+)\s*분/.test(left)) return true;
    const h = left.match(/(\d+)\s*시간/);
    return h && Number(h[1]) <= 1;
  };

  return (
    <section className={styles.endingSec} aria-label="오늘 마감 경매">
      <div className={styles.container}>
        <div className={styles.head}>
          <h2 className={styles.title}>오늘 마감 경매</h2>
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
        </div>

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
                  <img src={it.imageUrl} alt="" className={styles.thumb} />
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
                    {isUrgent(it.timeLeft) && (
                      <span className={styles.badge}>마감 임박</span>
                    )}
                  </div>

                  {/* 가격 라벨과 값 '딱 붙게' */}
                  <div className={styles.footer}>
                    <div className={styles.priceWrap}>
                      <span className={styles.dim}>현재 입찰가</span>
                      <strong className={styles.price}>
                        {formatWon(it.currentBid)}
                      </strong>
                    </div>
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
