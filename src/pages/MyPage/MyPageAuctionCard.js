/* eslint-disable jsx-a11y/role-supports-aria-props */
import { useEffect, useMemo, useState, useRef } from "react";
import { Icon } from "@iconify/react";
import styles from "../../styles/MyPage/MyPageAuctionCard.module.css";

/* 남은 시간: n일 HH:MM:SS - 항상 호출 */
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

export default function MyPageAuctionCard({ item, onChatClick }) {
  const images = useMemo(
    () => (item?.images?.length ? item.images : item?.image ? [item.image] : []),
    [item]
  );

  const [idx, setIdx] = useState(0);
  const go = (d) => images.length > 1 && setIdx((p) => (p + d + images.length) % images.length);

  const computedTimeLeft = useTimeLeft(item?.endAtISO, item?.isClosed);
  const timeLeft = item?.timeLeft ?? computedTimeLeft;

  // 텍스트 overflow 감지를 위한 refs
  const bodyRef = useRef(null);
  const titleRef = useRef(null);
  const metaRef = useRef(null);
  const meta1Ref = useRef(null);
  const meta2Ref = useRef(null);
  const [titleOverflow, setTitleOverflow] = useState(false);
  const [meta1Overflow, setMeta1Overflow] = useState(false);
  const [meta2Overflow, setMeta2Overflow] = useState(false);

  // overflow 여부 체크 - 부모 컨테이너 너비와 비교
  useEffect(() => {
    const checkOverflow = () => {
      const bodyWidth = bodyRef.current?.clientWidth || 0;
      const metaWidth = metaRef.current?.clientWidth || 0;

      if (titleRef.current && bodyWidth) {
        setTitleOverflow(titleRef.current.scrollWidth > bodyWidth);
      }
      if (meta1Ref.current && metaWidth) {
        setMeta1Overflow(meta1Ref.current.scrollWidth > metaWidth);
      }
      if (meta2Ref.current && metaWidth) {
        setMeta2Overflow(meta2Ref.current.scrollWidth > metaWidth);
      }
    };

    // DOM이 렌더링된 후 체크
    const timer = setTimeout(checkOverflow, 100);
    window.addEventListener('resize', checkOverflow);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [item]);

  const handleChatClick = (e) => {
    e.stopPropagation();
    onChatClick?.(item);
  };

  return (
    <article className={`${styles.card} ${item?.isFailedBid ? styles.failedCard : ''}`} tabIndex={-1}>
      {/* 썸네일 */}
      <div className={styles.thumb}>
        {images.length ? (
          <img className={styles.thumbImg} src={images[idx]} alt={item?.title || "auction image"} />
        ) : (
          <div className={styles.empty} />
        )}

        {/* ✅ 오늘 마감 배지만 노출 */}
        {item?.isEndingTodayOpen && <span className={styles.badge}>오늘 마감 경매</span>}

        {/* 낙찰 배지 */}
        {item?.isClosed && <span className={styles.closedBadge}>낙찰</span>}

        {/* 유찰 배지 */}
        {item?.isFailedBid && <span className={styles.failedBadge}>유찰</span>}

        {/* 슬라이더 컨트롤 */}
        {images.length > 1 && (
          <>
            <button className={`${styles.nav} ${styles.prev}`} onClick={() => go(-1)} aria-label="prev">
              <Icon icon="solar:alt-arrow-left-linear" />
            </button>
            <button className={`${styles.nav} ${styles.next}`} onClick={() => go(1)} aria-label="next">
              <Icon icon="solar:alt-arrow-right-linear" />
            </button>
            <div className={styles.dots}>
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

      {/* 본문 */}
      <div ref={bodyRef} className={styles.body}>
        <div className={styles.titleWrapper}>
          <h3
            ref={titleRef}
            className={`${styles.title} ${titleOverflow ? styles.titleOverflow : ''}`}
            title={item?.title}
          >
            {item?.title}
          </h3>
        </div>
        <div className={styles.views}>{item?.views?.toLocaleString()} views</div>

        <div ref={metaRef} className={styles.meta}>
          <div
            ref={meta1Ref}
            className={`${styles.metaItem} ${meta1Overflow ? styles.metaOverflow : ''}`}
          >
            <Icon icon="solar:chat-round-dots-linear" />
            <span>현재 참여자 수(Bidders): {item?.bidders?.toLocaleString()}명</span>
          </div>
          <div
            ref={meta2Ref}
            className={`${styles.metaItem} ${meta2Overflow ? styles.metaOverflow : ''}`}
          >
            <Icon icon="solar:clock-circle-linear" />
            <span>남은 시간 (Time Left): {timeLeft}</span>
          </div>
        </div>

        <div className={styles.priceBox}>
          <div className={styles.priceItem}>
            <span className={styles.label}>시작가</span>
            <strong>₩ {item?.startPrice?.toLocaleString()}</strong>
          </div>
          <div className={styles.priceRow}>
            <div className={styles.priceItem}>
              <span className={styles.label}>{item?.isClosed ? '낙찰가' : '현재가'}</span>
              <strong className={styles.current}>₩ {item?.currentPrice?.toLocaleString()}</strong>
            </div>
            {item?.isClosed && onChatClick && (
              <button className={styles.chatButtonSmall} onClick={handleChatClick} type="button" aria-label="채팅하기">
                <Icon icon="solar:chat-round-dots-linear" />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
