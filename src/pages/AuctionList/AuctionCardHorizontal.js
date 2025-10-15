import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import styles from "../../styles/AuctionList/AuctionCardHorizontal.module.css";

function useTimeLeft(endAtISO, disabled) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (disabled) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [disabled]);

  if (disabled || !endAtISO) return "종료";
  const ms = Math.max(0, new Date(endAtISO).getTime() - now);
  const sec = Math.floor(ms / 1000);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const to2 = (n) => String(n).padStart(2, "0");
  return ms === 0 ? "종료" : `${d}일 ${to2(h)}:${to2(m)}:${to2(s)}`;
}

export default function AuctionCardHorizontal({ item }) {
  const images = useMemo(
    () => (item?.images?.length ? item.images : item?.image ? [item.image] : []),
    [item]
  );
  const [idx, setIdx] = useState(0);
  const go = (d) => images.length > 1 && setIdx((p) => (p + d + images.length) % images.length);

  const computedTimeLeft = useTimeLeft(item?.endAtISO, item?.isClosed);
  const timeLeft = item?.timeLeft ?? computedTimeLeft;

  return (
    <article className={styles.card}>
      {/* 썸네일 */}
      <div className={styles.thumb}>
        {/* 👉 이미지 기준 좌표계를 만드는 래퍼 */}
        <div className={styles.thumbInner}>
          {images.length ? (
            <img className={styles.thumbImg} src={images[idx]} alt={item?.title || "auction"} />
          ) : (
            <div className={styles.empty} />
          )}

          {/* 오늘 마감 배지 */}
          {item?.isEndingTodayOpen && (
            <span className={styles.badge}>오늘 마감 경매</span>
          )}

          {images.length > 1 && (
            <>
              <button
                className={`${styles.nav} ${styles.prev}`}
                onClick={() => go(-1)}
                aria-label="prev"
              >
                <Icon icon="solar:alt-arrow-left-linear" />
              </button>
              <button
                className={`${styles.nav} ${styles.next}`}
                onClick={() => go(1)}
                aria-label="next"
              >
                <Icon icon="solar:alt-arrow-right-linear" />
              </button>
              <div className={styles.dots} role="tablist" aria-label="images">
                {images.map((_, i) => (
                  <button
                    key={i}
                    className={`${styles.dot} ${i === idx ? styles.activeDot : ""}`}
                    aria-selected={i === idx}
                    onClick={() => setIdx(i)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 본문 */}
      <div className={styles.body}>
        <div className={styles.header}>
          <h3 className={styles.title} title={item?.title}>{item?.title}</h3>
          <div className={styles.metaRight}>
            <span className={styles.views}>{item?.views?.toLocaleString()} views</span>
          </div>
        </div>

        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <Icon icon="solar:calendar-linear" />
            <div className={styles.metaCol}>
              <div className={styles.metaLabel}>시작 날짜 (Start)</div>
              <div className={styles.metaValue}>{item?.startAt}</div>
            </div>
          </div>

          <div className={styles.metaItem}>
            <Icon icon="solar:calendar-linear" />
            <div className={styles.metaCol}>
              <div className={styles.metaLabel}>종료 날짜 (End)</div>
              <div className={styles.metaValue}>{item?.endAt}</div>
            </div>
          </div>

          <div className={styles.metaItem}>
            <Icon icon="solar:chat-round-dots-linear" />
            <div className={styles.metaCol}>
              <div className={styles.metaLabel}>현재 참여자 수 (Bidders)</div>
              <div className={styles.metaValue}>{item?.bidders?.toLocaleString()}명</div>
            </div>
          </div>

          <div className={styles.metaItem}>
            <Icon icon="solar:clock-circle-linear" />
            <div className={styles.metaCol}>
              <div className={styles.metaLabel}>남은 시간 (Time Left)</div>
              <div className={styles.metaValue}>{timeLeft}</div>
            </div>
          </div>
        </div>

        <div className={styles.priceRow}>
          <div className={styles.priceItem}>
            <span className={styles.label}>시작가</span>
            <strong>₩ {item?.startPrice?.toLocaleString()}</strong>
          </div>
          <div className={styles.priceItem}>
            <span className={styles.label}>현재가</span>
            <strong className={styles.current}>₩ {item?.currentPrice?.toLocaleString()}</strong>
          </div>
        </div>
      </div>
    </article>
  );
}
