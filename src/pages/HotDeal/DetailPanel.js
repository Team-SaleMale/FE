// src/pages/HotDeal/DetailPanel.js
import { useEffect, useMemo, useState } from "react";
import styles from "../../styles/HotDeal/DetailPanel.module.css";

export default function DetailPanel({ item, onClose, onBid }) {
  const [heroIdx, setHeroIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // BidHistory 로컬 상태
  const [history, setHistory] = useState([]);

  // 이미지: images / imageUrls / coverImg 모두 대응
  const images = useMemo(() => {
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

  // 아이템 변경 시: 메인 이미지 & 히스토리 초기화
  useEffect(() => {
    setHeroIdx(0);
    if (Array.isArray(item?.bidHistory)) {
      // 최신이 위로 오도록 역순
      setHistory([...item.bidHistory].reverse());
    } else {
      setHistory([]);
    }
  }, [item]);

  // ESC / 좌우키
  useEffect(() => {
    if (!item) return;

    const onKey = (e) => {
      if (e.key === "Escape") {
        if (lightboxOpen) setLightboxOpen(false);
        else onClose?.();
      }
      if (lightboxOpen) {
        const len = Math.max(images.length, 1);
        if (e.key === "ArrowRight") setHeroIdx((p) => (p + 1) % len);
        if (e.key === "ArrowLeft") setHeroIdx((p) => (p - 1 + len) % len);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, onClose, lightboxOpen, images.length]);

  // HotDealBid에서 발생시키는 커스텀 이벤트 → 히스토리 갱신
  useEffect(() => {
    const onBidSubmitted = (e) => {
      const { itemId, price, bidder, ts } = e.detail || {};
      if (!item) return;
      const key = item.itemId ?? item.id ?? null;
      if (key == null || itemId !== key) return;

      setHistory((prev) => [{ price, bidder, ts }, ...prev]);
    };

    window.addEventListener("valuebid:bid-submitted", onBidSubmitted);
    return () =>
      window.removeEventListener("valuebid:bid-submitted", onBidSubmitted);
  }, [item]);

  if (!item) return null;

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

  const heroSrc = images[heroIdx] || images[0] || "";

  const startsAt = item.startsAt ?? item.createdAt ?? null;
  const endsAt = item.endsAt ?? item.endTime ?? null;

  const startPrice = item.startPrice ?? item.auctionInfo?.startPrice;
  const currentPrice =
    item.currentPrice ?? item.auctionInfo?.currentPrice;
  const bidCount =
    item.bidCount ?? item.bidderCount ?? item.auctionInfo?.bidCount;

  const storeName =
    item.storeName ??
    item.sellerNickname ??
    item.sellerInfo?.nickname ??
    "";

  const sellerDesc = item.sellerDesc ?? item.description ?? "";

  // 화면에 보여줄 "상품 제목"은 name 우선, 없으면 title 사용
  const itemTitle = item.name ?? item.title ?? "";

  // 공유 로직 (패널 헤더 + 라이트박스에서 공통 사용)
  const shareItem = async () => {
    const url = window.location.origin + (item.url || "");
    const data = {
      title: itemTitle || "ValueBid",
      text: storeName ? `${storeName} - ${itemTitle}` : itemTitle,
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        alert("링크가 클립보드에 복사되었어요.");
      }
    } catch {
      // 무시
    }
  };

  return (
    <>
      <aside
        className={`${styles.panel} ${styles.open}`}
        role="dialog"
        aria-modal="true"
      >
        {/* 헤더 */}
        <header className={styles.header}>
          <div className={styles.headerText}>
            {storeName && (
              <div className={styles.storeName}>{storeName}</div>
            )}
            <h2 className={styles.title} title={itemTitle}>
              {itemTitle}
            </h2>
          </div>

          <div className={styles.headerActions}>
            <button
              className={styles.actionBtn}
              onClick={shareItem}
            >
              공유
            </button>
            <button
              className={`${styles.actionBtn} ${styles.closeBtn}`}
              onClick={onClose}
              aria-label="닫기"
            >
              닫기
            </button>
          </div>
        </header>

        {/* 본문 */}
        <div className={styles.body}>
          {/* 이미지 */}
          <section className={styles.section}>
            <button
              type="button"
              className={styles.heroBtn}
              onClick={() => setLightboxOpen(true)}
              aria-label="이미지 크게 보기"
            >
              {heroSrc && (
                <img
                  className={styles.hero}
                  src={heroSrc}
                  alt=""
                />
              )}
            </button>

            {images.length > 1 && (
              <div className={styles.thumbRow}>
                {images.slice(0, 12).map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`${styles.thumbBtn} ${
                      i === heroIdx ? styles.thumbActive : ""
                    }`}
                    onClick={() => setHeroIdx(i)}
                    aria-label={`이미지 ${i + 1} 보기`}
                  >
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* 판매자 설명 */}
          {sellerDesc && (
            <section className={styles.section}>
              <h3 className={styles.secTitle}>판매자 설명</h3>
              <p className={styles.desc}>{sellerDesc}</p>
            </section>
          )}

          {/* 경매 정보 */}
          <section className={styles.sectionGrid}>
            <h3 className={styles.secTitle}>경매 정보</h3>
            <div className={styles.kv}>
              <span>경매 시작</span>
              <b>{fmtTime(startsAt)}</b>
            </div>
            <div className={styles.kv}>
              <span>경매 마감</span>
              <b>{fmtTime(endsAt)}</b>
            </div>
            <div className={styles.kv}>
              <span>시작가</span>
              <b>₩{fmt(startPrice)}</b>
            </div>
            <div className={styles.kv}>
              <span>현재가</span>
              <b>₩{fmt(currentPrice)}</b>
            </div>
            <div className={styles.kv}>
              <span>입찰자 수</span>
              <b>{fmt(bidCount)}</b>
            </div>
          </section>

          {/* Bid History */}
          <section className={styles.section}>
            <h3 className={styles.secTitle}>Bid History</h3>

            {history.length === 0 ? (
              <div className={styles.placeholder}>
                아직 입찰 내역이 없습니다.
              </div>
            ) : (
              <ul className={styles.history}>
                {history.map((h, i) => (
                  <li key={i} className={styles.hItem}>
                    <div className={styles.hLeft}>
                      <span className={styles.hPrice}>
                        ₩{fmt(h.price)}
                      </span>
                      {h.bidder && (
                        <span className={styles.hBidder}>
                          {h.bidder}
                        </span>
                      )}
                    </div>
                    <time
                      className={styles.hTime}
                      dateTime={
                        h.ts ? new Date(h.ts).toISOString() : undefined
                      }
                    >
                      {fmtTime(h.ts)}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* 하단 CTA */}
          <div className={styles.stickyCta}>
            <button
              className={styles.bidBtn}
              onClick={() => onBid?.(item)}
            >
              입찰하기
            </button>
          </div>
        </div>
      </aside>

      {/* dim */}
      <div className={styles.dim} onClick={onClose} />

      {/* 라이트박스 */}
      {lightboxOpen && (
        <div className={styles.lb} role="dialog" aria-modal="true">
          <div
            className={styles.lbBackdrop}
            onClick={() => setLightboxOpen(false)}
          />
          <div className={styles.lbShell}>
            <div className={styles.lbContent}>
              {/* 상단 오른쪽 공유 / 닫기 */}
              <div className={styles.lbTopRight}>
                <button
                  className={styles.lbShare}
                  onClick={shareItem}
                >
                  공유
                </button>
                <button
                  className={styles.lbClose}
                  onClick={() => setLightboxOpen(false)}
                >
                  닫기
                </button>
              </div>

              {/* 메인 이미지 + 좌우 네비 */}
              <div className={styles.lbMain}>
                {images.length > 1 && (
                  <button
                    className={`${styles.lbNav} ${styles.lbPrev}`}
                    onClick={() =>
                      setHeroIdx(
                        (p) => (p - 1 + images.length) % images.length
                      )
                    }
                    aria-label="이전 이미지"
                  >
                    ‹
                  </button>
                )}

                {images[heroIdx] && (
                  <img
                    className={styles.lbHero}
                    src={images[heroIdx]}
                    alt=""
                  />
                )}

                {images.length > 1 && (
                  <button
                    className={`${styles.lbNav} ${styles.lbNext}`}
                    onClick={() =>
                      setHeroIdx(
                        (p) => (p + 1) % images.length
                      )
                    }
                    aria-label="다음 이미지"
                  >
                    ›
                  </button>
                )}
              </div>

              {/* 하단 썸네일 + 페이지 인디케이터 */}
              {images.length > 1 && (
                <div className={styles.lbBottom}>
                  <div className={styles.lbThumbStrip}>
                    {images.map((src, i) => (
                      <button
                        key={i}
                        className={`${styles.lbThumbBtn} ${
                          i === heroIdx ? styles.lbThumbActive : ""
                        }`}
                        onClick={() => setHeroIdx(i)}
                        aria-label={`이미지 ${i + 1}로 이동`}
                      >
                        <img src={src} alt="" />
                      </button>
                    ))}
                  </div>
                  <div className={styles.lbPage}>
                    {heroIdx + 1} / {images.length}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/*
🔔 HotDealBid에서 입찰 성공 후 아래 형태로 이벤트를 쏘세요:
window.dispatchEvent(
  new CustomEvent("valuebid:bid-submitted", {
    detail: { itemId: item.itemId, price, bidder: "나", ts: Date.now() }
  })
);
*/
