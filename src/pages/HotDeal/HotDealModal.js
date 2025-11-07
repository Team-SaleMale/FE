// src/pages/HotDeal/HotDealModal.js
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "../../styles/HotDeal/HotDealModal.module.css";

export default function HotDealModal({ open, item, onClose, onDetail }) {
  // 1) 훅들: 최상단 고정 (조건문/루프/return 앞)
  const wrapRef = useRef(null);
  const trackRef = useRef(null);

  const [hover, setHover] = useState(false);
  const [idx, setIdx] = useState(0);

  // item이 없어도 훅은 호출돼야 하므로, 빈 배열을 반환하도록 처리
  const imgs = useMemo(() => {
    const arr = Array.isArray(item?.images) ? item.images.filter(Boolean) : [];
    if (arr.length) return arr;
    return item?.coverImg ? [item.coverImg] : [];
  }, [item]);

  // 키보드: ESC/좌우 화살표
  useEffect(() => {
    const onKey = (e) => {
      if (!open) return;
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, onClose, imgs.length]);

  // 인덱스 → 스크롤 동기화
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: el.clientWidth * idx, behavior: "smooth" });
  }, [idx]);

  // 2) Guard는 훅 **뒤**에
  if (!open || !item) return null;

  const fmt = (v) => (v ?? 0).toLocaleString();

  const go = (d) => {
    if (imgs.length < 2) return;
    setIdx((p) => (p + d + imgs.length) % imgs.length);
  };

  const goDetail = () => {
    onClose?.();
    onDetail?.(item);
  };

  return (
    <div className={styles.modal} role="dialog" aria-modal="true">
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.card}>
        <button className={styles.close} onClick={onClose} aria-label="닫기">✕</button>

        <div className={styles.header}>
          <div className={styles.title}>{item.title}</div>
          <div className={styles.store}>{item.storeName}</div>
        </div>

        <div className={styles.body}>
          {/* 이미지 캐러셀 (AuctionCardVertical hover UX) */}
          <div
            ref={wrapRef}
            className={styles.thumb}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            <div ref={trackRef} className={styles.carousel}>
              {imgs.length ? (
                imgs.map((src, i) => <img key={i} className={styles.thumbImg} src={src} alt="" />)
              ) : (
                <div className={styles.empty} />
              )}
            </div>

            {imgs.length > 1 && (
              <>
                <button
                  className={`${styles.nav} ${styles.prev} ${hover ? styles.show : ""}`}
                  onClick={() => go(-1)}
                  aria-label="이전"
                >‹</button>
                <button
                  className={`${styles.nav} ${styles.next} ${hover ? styles.show : ""}`}
                  onClick={() => go(1)}
                  aria-label="다음"
                >›</button>

                <div className={styles.dots}>
                  {imgs.map((_, i) => (
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

          {/* 정보 */}
          <div className={styles.meta}>
            <div className={styles.row}><span>경매 시작</span><b>{item.startsAt}</b></div>
            <div className={styles.row}><span>경매 마감</span><b>{item.endsAt}</b></div>
            <div className={styles.row}><span>시작가</span><b>₩{fmt(item.startPrice)}</b></div>
            <div className={styles.row}><span>현재가</span><b>₩{fmt(item.currentPrice)}</b></div>
            <div className={styles.row}><span>입찰수</span><b>{fmt(item.bidCount)}</b></div>
            <div className={styles.cta}>
              <button className={styles.detail} onClick={goDetail}>상세보기</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
