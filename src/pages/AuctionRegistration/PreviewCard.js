// FE/src/pages/AuctionRegistration/PreviewCard.js
// 목적: imagesProp가 string[] 또는 object[]로 와도 안정적으로 URL만 추출해 미리보기 이미지를 렌더링합니다.
// 추가: 이미지 로드 실패 시(onError) 깨진 아이콘 대신 빈 썸네일로 대체합니다.

import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";
import styles from "../../styles/AuctionRegistration/PreviewCard.module.css";

function pickImageUrl(item) {
  // ✅ string이면 그대로
  if (typeof item === "string") return item.trim();

  // ✅ object면 가능한 키들에서 URL 추출 (서버/프론트 포맷 혼재 대응)
  if (item && typeof item === "object") {
    const cand =
      item.url ||
      item.imageUrl ||
      item.src ||
      item.uploadedUrl ||
      item.originalUrl ||
      item.thumbnailUrl;

    return typeof cand === "string" ? cand.trim() : "";
  }
  return "";
}

export default function PreviewCard({
  imageUrl = "",
  images: imagesProp, // 선택: 여러 장 지원 (string[] | object[])
  title = "미리보기",
  views = 0,
  bidders = 0,
  timeLeftLabel = "--:--:--",
  startPrice = 0,
  currentPrice = 0,
}) {
  // ✅ 이미지 배열 정규화: 어떤 형태든 URL string[] 로 변환
  const images = useMemo(() => {
    const base = Array.isArray(imagesProp) && imagesProp.length
      ? imagesProp
      : (typeof imageUrl === "string" && imageUrl ? [imageUrl] : []);

    const normalized = base
      .map(pickImageUrl)
      .filter(Boolean);

    // 중복 제거(선택)
    const uniq = Array.from(new Set(normalized));
    return uniq;
  }, [imagesProp, imageUrl]);

  const [idx, setIdx] = useState(0);
  const hasMulti = images.length > 1;

  // 이미지 로드 실패 인덱스 기록
  const [broken, setBroken] = useState({}); // { [index]: true }

  // 이미지 리스트가 바뀌면 인덱스/스크롤/에러 상태 리셋
  useEffect(() => {
    setIdx(0);
    setBroken({});
    // 첫 슬라이드로 스냅
    // (trackRef가 아직 없을 수 있으므로 requestAnimationFrame)
    // eslint-disable-next-line no-use-before-define
    requestAnimationFrame(() => goTo(0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.join("|")]);

  // 스크롤 스냅 기반 슬라이더
  const trackRef = useRef(null);

  const goTo = useCallback((i) => {
    const wrap = trackRef.current;
    if (!wrap) return;
    const el = wrap.children?.[i];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      setIdx(i);
    }
  }, []);

  const go = (d) => {
    if (!hasMulti) return;
    const next = (idx + d + images.length) % images.length;
    goTo(next);
  };

  // 스크롤 위치 → 인덱스 동기화(스와이프 시)
  const onScroll = useCallback(() => {
    const wrap = trackRef.current;
    if (!wrap) return;
    const w = wrap.clientWidth || 1;
    const i = Math.round(wrap.scrollLeft / w);
    const clamped = Math.max(0, Math.min(images.length - 1, i));
    if (clamped !== idx) setIdx(clamped);
  }, [idx, images.length]);

  // 리사이즈 시 스냅 재정렬
  useEffect(() => {
    const r = () => goTo(idx);
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, [idx, goTo]);

  const handleImgError = (i) => {
    setBroken((prev) => ({ ...prev, [i]: true }));
  };

  const allBroken = images.length > 0 && images.every((_, i) => broken[i]);

  return (
    <article className={styles.card} tabIndex={-1} aria-label="preview card">
      {/* 썸네일 */}
      <div className={styles.thumb}>
        {images.length && !allBroken ? (
          <div
            className={styles.slider}
            ref={trackRef}
            onScroll={hasMulti ? onScroll : undefined}
          >
            {images.map((src, i) => (
              <div className={styles.slide} key={`${src}-${i}`}>
                {broken[i] ? (
                  <div className={styles.empty} />
                ) : (
                  <img
                    className={styles.thumbImg}
                    src={src}
                    alt={title || "preview image"}
                    draggable={false}
                    onError={() => handleImgError(i)}
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.empty} />
        )}

        {/* 슬라이더 컨트롤 */}
        {hasMulti && !allBroken && (
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

      {/* 본문 */}
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
