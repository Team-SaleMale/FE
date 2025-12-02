// src/pages/HotDeal/HotDealModal.js
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "../../styles/HotDeal/HotDealModal.module.css";

export default function HotDealModal({
  open,
  item,
  loading,
  onClose,
  onDetail,
}) {
  const wrapRef = useRef(null);
  const trackRef = useRef(null);

  const [hover, setHover] = useState(false);
  const [idx, setIdx] = useState(0);

  // 이미지: string / object(imageUrl) / imageUrls 모두 대응
  const imgs = useMemo(() => {
    if (!item) return [];

    if (Array.isArray(item.images) && item.images.length) {
      return item.images
        .map((img) => (typeof img === "string" ? img : img.imageUrl))
        .filter(Boolean);
    }

    if (Array.isArray(item.imageUrls) && item.imageUrls.length) {
      return item.imageUrls.filter(Boolean);
    }

    if (item.coverImg) return [item.coverImg];

    return [];
  }, [item]);

  const go = (d) => {
    if (imgs.length < 2) return;
    setIdx((p) => (p + d + imgs.length) % imgs.length);
  };

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
    el.scrollTo({
      left: el.clientWidth * idx,
      behavior: "smooth",
    });
  }, [idx]);

  // Guard
  if (!open || !item) return null;

  const fmt = (v) => (v ?? 0).toLocaleString();
  const fmtTime = (t) => {
    if (!t) return "-";
    try {
      const d = new Date(String(t));
      return isNaN(d) ? "-" : d.toLocaleString();
    } catch {
      return "-";
    }
  };

  const goDetail = () => {
    onClose?.();
    onDetail?.(item);
  };

  const startsAt = item.startsAt ?? item.createdAt ?? null;
  const endsAt = item.endsAt ?? item.endTime ?? null;

  const startPrice = item.startPrice ?? item.auctionInfo?.startPrice;
  const currentPrice = item.currentPrice ?? item.auctionInfo?.currentPrice;
  const bidCount =
    item.bidCount ?? item.bidderCount ?? item.auctionInfo?.bidCount;

  const storeName =
    item.storeName ?? item.sellerNickname ?? item.sellerInfo?.nickname ?? "";

  // ✅ 화면에 보여줄 상품 제목: name 우선, 없으면 title 사용
  const itemTitle = item.name ?? item.title ?? "";

  return (
    <div className={styles.modal} role="dialog" aria-modal="true">
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.card}>
        <button
          className={styles.close}
          onClick={onClose}
          aria-label="닫기"
        >
          ✕
        </button>

        <div className={styles.header}>
          <div className={styles.title}>{itemTitle}</div>
          {storeName && (
            <div className={styles.store}>{storeName}</div>
          )}
        </div>

        <div className={styles.body}>
          {/* 이미지 캐러셀 */}
          <div
            ref={wrapRef}
            className={styles.thumb}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            <div ref={trackRef} className={styles.carousel}>
              {imgs.length ? (
                imgs.map((src, i) => (
                  <img
                    key={i}
                    className={styles.thumbImg}
                    src={src}
                    alt=""
                  />
                ))
              ) : (
                <div className={styles.empty} />
              )}
            </div>

            {imgs.length > 1 && (
              <>
                <button
                  className={`${styles.nav} ${styles.prev} ${
                    hover ? styles.show : ""
                  }`}
                  onClick={() => go(-1)}
                  aria-label="이전"
                >
                  ‹
                </button>
                <button
                  className={`${styles.nav} ${styles.next} ${
                    hover ? styles.show : ""
                  }`}
                  onClick={() => go(1)}
                  aria-label="다음"
                >
                  ›
                </button>

                <div className={styles.dots}>
                  {imgs.map((_, i) => (
                    <button
                      key={i}
                      className={`${styles.dot} ${
                        i === idx ? styles.activeDot : ""
                      }`}
                      aria-selected={i === idx}
                      onClick={() => setIdx(i)}
                    />
                  ))}
                </div>
              </>
            )}

            {loading && (
              <div className={styles.loading}>
                상세 정보를 불러오는 중...
              </div>
            )}
          </div>

          {/* 정보 */}
          <div className={styles.meta}>
            <div className={styles.row}>
              <span>경매 시작</span>
              <b>{fmtTime(startsAt)}</b>
            </div>
            <div className={styles.row}>
              <span>경매 마감</span>
              <b>{fmtTime(endsAt)}</b>
            </div>
            <div className={styles.row}>
              <span>시작가</span>
              <b>₩{fmt(startPrice)}</b>
            </div>
            <div className={styles.row}>
              <span>현재가</span>
              <b>₩{fmt(currentPrice)}</b>
            </div>
            <div className={styles.row}>
              <span>입찰수</span>
              <b>{fmt(bidCount)}</b>
            </div>
            <div className={styles.cta}>
              <button
                className={styles.detail}
                onClick={goDetail}
              >
                상세보기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
