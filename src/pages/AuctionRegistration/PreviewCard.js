/* eslint-disable jsx-a11y/role-supports-aria-props */
import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";
import styles from "../../styles/AuctionRegistration/PreviewCard.module.css";

export default function PreviewCard({
  imageUrl = "",
  images: imagesProp,          // 선택: 여러 장 지원
  title = "미리보기",
  views = 0,
  bidders = 0,
  timeLeftLabel = "--:--:--",
  startPrice = 0,
  currentPrice = 0,
}) {
  // 이미지 배열 정규화
  const images = useMemo(() => {
    if (Array.isArray(imagesProp) && imagesProp.length) return imagesProp;
    if (typeof imageUrl === "string" && imageUrl) return [imageUrl];
    return [];
  }, [imagesProp, imageUrl]);

  const [idx, setIdx] = useState(0);
  const hasMulti = images.length > 1;

  // 스크롤 스냅 기반 슬라이더
  const trackRef = useRef(null);
  const goTo = useCallback(
    (i) => {
      if (!trackRef.current) return;
      const el = trackRef.current.children[i];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        setIdx(i);
      }
    },
    []
  );

  const go = (d) => hasMulti && goTo((idx + d + images.length) % images.length);

  // 스크롤 위치 → 인덱스 동기화(스와이프 시)
  const onScroll = useCallback(() => {
    const wrap = trackRef.current;
    if (!wrap) return;
    const w = wrap.clientWidth;
    const i = Math.round(wrap.scrollLeft / w);
    if (i !== idx) setIdx(Math.max(0, Math.min(images.length - 1, i)));
  }, [idx, images.length]);

  // 리사이즈 시 스냅 재정렬
  useEffect(() => {
    const r = () => goTo(idx);
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, [idx, goTo]);

  return (
    <article className={styles.card} tabIndex={-1} aria-label="preview card">
      {/* 썸네일 (고정 높이 내) */}
      <div className={styles.thumb}>
        {images.length ? (
          <div
            className={styles.slider}
            ref={trackRef}
            onScroll={hasMulti ? onScroll : undefined}
          >
            {images.map((src, i) => (
              <div className={styles.slide} key={i}>
                <img
                  className={styles.thumbImg}
                  src={src}
                  alt={title || "preview image"}
                  draggable={false}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.empty} />
        )}

        {/* 오늘 마감 배지(필요 시 프롭으로 제어 가능) */}
        {/* <span className={styles.badge}>오늘 마감 경매</span> */}

        {/* 슬라이더 컨트롤 */}
        {hasMulti && (
          <>
            <button
              className={`${styles.nav} ${styles.prev}`}
              onClick={() => go(-1)}
              aria-label="previous image"
              type="button"
            >
              <Icon icon="solar:alt-arrow-left-linear" />
            </button>
            <button
              className={`${styles.nav} ${styles.next}`}
              onClick={() => go(1)}
              aria-label="next image"
              type="button"
            >
              <Icon icon="solar:alt-arrow-right-linear" />
            </button>

            <div className={styles.dots} role="tablist" aria-label="image dots">
              {images.map((_, i) => (
                <button
                  key={i}
                  className={`${styles.dot} ${i === idx ? styles.activeDot : ""}`}
                  aria-selected={i === idx}
                  aria-label={`image ${i + 1}`}
                  onClick={() => goTo(i)}
                  type="button"
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* 본문: 내용 필드 그대로 */}
      <div className={styles.body}>
        <h3 className={styles.title} title={title}>{title}</h3>

        <div className={styles.views}>
          {Number(views).toLocaleString()} views
        </div>

        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <Icon icon="solar:chat-round-dots-linear" />
            <span>현재 참여자 수(Bidders): {Number(bidders).toLocaleString()}명</span>
          </div>
          <div className={styles.metaItem}>
            <Icon icon="solar:clock-circle-linear" />
            <span>남은 시간 (Time Left): {timeLeftLabel}</span>
          </div>
        </div>

        <div className={styles.priceBox}>
          <div className={styles.priceItem}>
            <span className={styles.label}>시작가</span>
            <strong>₩ {Number(startPrice).toLocaleString()}</strong>
          </div>
          <div className={styles.priceItem}>
            <span className={styles.label}>현재가</span>
            <strong className={styles.current}>₩ {Number(currentPrice).toLocaleString()}</strong>
          </div>
        </div>
      </div>
    </article>
  );
}
