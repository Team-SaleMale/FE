// src/pages/HotDeal/DetailPanel.js
import { useEffect, useMemo, useState } from "react";
import styles from "../../styles/HotDeal/DetailPanel.module.css";

export default function DetailPanel({ item, onClose, onBid }) {
  // 항상 호출되는 훅
  const [heroIdx, setHeroIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // ✅ BidHistory 로컬 상태 (최신이 위로 쌓이게)
  const [history, setHistory] = useState([]);

  // 이미지 안전 메모이즈
  const images = useMemo(() => {
    const arr = Array.isArray(item?.images) ? item.images.filter(Boolean) : [];
    if (arr.length) return arr;
    return item?.coverImg ? [item.coverImg] : [];
  }, [item]);

  // 아이템 바뀌면 메인 이미지 & 히스토리 초기화
  useEffect(() => {
    setHeroIdx(0);
    setHistory(Array.isArray(item?.bidHistory) ? [...item.bidHistory].reverse() : []);
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

  // ✅ HotDealBid에서 발생시키는 커스텀 이벤트 수신 → 히스토리 갱신
  useEffect(() => {
    const onBidSubmitted = (e) => {
      const { itemId, price, bidder, ts } = e.detail || {};
      if (!item || item.id == null || itemId !== item.id) return;
      setHistory((prev) => [{ price, bidder, ts }, ...prev]);
    };
    window.addEventListener("valuebid:bid-submitted", onBidSubmitted);
    return () => window.removeEventListener("valuebid:bid-submitted", onBidSubmitted);
  }, [item]);

  if (!item) return null;

  const fmt = (v) => (v ?? 0).toLocaleString();
  const fmtTime = (t) => {
    try {
      const d = typeof t === "number" ? new Date(t) : new Date(String(t));
      return isNaN(d) ? "-" : d.toLocaleString();
    } catch { return "-"; }
  };

  // 공유: Web Share API → 복사 백업
  const share = async () => {
    const url = window.location.origin + (item.url || "");
    const data = {
      title: item.title || "ValueBid",
      text: item.storeName ? `${item.storeName} - ${item.title}` : item.title,
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
      } else {
        await navigator.clipboard?.writeText(url);
        alert("링크가 클립보드에 복사되었어요.");
      }
    } catch {
      /* 사용자 취소 등은 무시 */
    }
  };

  const heroSrc = images[heroIdx] || images[0] || "";

  return (
    <>
      <aside className={`${styles.panel} ${styles.open}`} role="dialog" aria-modal="true">
        {/* ── 헤더 ───────────────────────────────────── */}
        <header className={styles.header}>
          <div className={styles.headerText}>
            {item.storeName && <div className={styles.storeName}>{item.storeName}</div>}
            <h2 className={styles.title} title={item.title}>
              {item.title}
            </h2>
            {/* 카테고리 표시는 제거됨 */}
          </div>

          <div className={styles.headerActions}>
            <button className={styles.actionBtn} onClick={share}>공유</button>
            <button
              className={`${styles.actionBtn} ${styles.closeBtn}`}
              onClick={onClose}
              aria-label="닫기"
            >
              닫기
            </button>
          </div>
        </header>

        {/* ── 본문 ───────────────────────────────────── */}
        <div className={styles.body}>
          {/* 이미지 (클릭 시 라이트박스) */}
          <section className={styles.section}>
            <button
              type="button"
              className={styles.heroBtn}
              onClick={() => setLightboxOpen(true)}
              aria-label="이미지 크게 보기"
            >
              <img className={styles.hero} src={heroSrc} alt="" />
            </button>

            {images.length > 1 && (
              <div className={styles.thumbRow}>
                {images.slice(0, 12).map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`${styles.thumbBtn} ${i === heroIdx ? styles.thumbActive : ""}`}
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
          {item.sellerDesc && (
            <section className={styles.section}>
              <h3 className={styles.secTitle}>판매자 설명</h3>
              <p className={styles.desc}>{item.sellerDesc}</p>
            </section>
          )}

          {/* 경매 정보 */}
          <section className={styles.sectionGrid}>
            <h3 className={styles.secTitle}>경매 정보</h3>
            <div className={styles.kv}><span>경매 시작</span><b>{item.startsAt}</b></div>
            <div className={styles.kv}><span>경매 마감</span><b>{item.endsAt}</b></div>
            <div className={styles.kv}><span>시작가</span><b>₩{fmt(item.startPrice)}</b></div>
            <div className={styles.kv}><span>현재가</span><b>₩{fmt(item.currentPrice)}</b></div>
            <div className={styles.kv}><span>입찰자 수</span><b>{fmt(item.bidCount)}</b></div>
            <div className={styles.kv}><span>조회수</span><b>{fmt(item.views)}</b></div>
          </section>

          {/* ✅ Bid History */}
          <section className={styles.section}>
            <h3 className={styles.secTitle}>Bid History</h3>

            {history.length === 0 ? (
              <div className={styles.placeholder}>아직 입찰 내역이 없습니다.</div>
            ) : (
              <ul className={styles.history}>
                {history.map((h, i) => (
                  <li key={i} className={styles.hItem}>
                    <div className={styles.hLeft}>
                      <span className={styles.hPrice}>₩{fmt(h.price)}</span>
                      {h.bidder && <span className={styles.hBidder}>{h.bidder}</span>}
                    </div>
                    <time className={styles.hTime} dateTime={new Date(h.ts || Date.now()).toISOString()}>
                      {fmtTime(h.ts)}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* 하단 CTA */}
          <div className={styles.stickyCta}>
            <button className={styles.bidBtn} onClick={() => onBid?.(item)}>
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
          <div className={styles.lbBackdrop} onClick={() => setLightboxOpen(false)} />
          <div className={styles.lbBody}>
            <button
              className={`${styles.lbNav} ${styles.lbPrev}`}
              onClick={() => setHeroIdx((p) => (p - 1 + images.length) % images.length)}
              aria-label="이전 이미지"
            >
              ‹
            </button>

            <img className={styles.lbHero} src={images[heroIdx]} alt="" />

            <button
              className={`${styles.lbNav} ${styles.lbNext}`}
              onClick={() => setHeroIdx((p) => (p + 1) % images.length)}
              aria-label="다음 이미지"
            >
              ›
            </button>

            <div className={styles.lbThumbRow}>
              {images.map((src, i) => (
                <button
                  key={i}
                  className={`${styles.lbThumbBtn} ${i === heroIdx ? styles.lbThumbActive : ""}`}
                  onClick={() => setHeroIdx(i)}
                  aria-label={`이미지 ${i + 1}로 이동`}
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>

            <button className={styles.lbClose} onClick={() => setLightboxOpen(false)}>
              닫기
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/*
🔔 HotDealBid에서 입찰 성공 후 아래 형태로 이벤트를 쏘세요:
window.dispatchEvent(new CustomEvent("valuebid:bid-submitted", {
  detail: { itemId: item.id, price, bidder: "나", ts: Date.now() }
}));
*/
