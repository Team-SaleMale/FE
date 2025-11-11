/* eslint-disable jsx-a11y/role-supports-aria-props */
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import styles from "../../styles/AuctionProductDetails/MediaGallery.module.css";

/**
 * props.images(optional): [{ id?:string|number, url:string, type?:'image'|'video', alt?:string }]
 * - 없는 경우 로컬 더미 사용
 */
import img1 from "../../assets/img/AuctionProductDetails/ProductImage/ipad-01.png";
import img2 from "../../assets/img/AuctionProductDetails/ProductImage/ipad-02.png";
import img3 from "../../assets/img/AuctionProductDetails/ProductImage/ipad-03.png";
import img4 from "../../assets/img/AuctionProductDetails/ProductImage/ipad-04.png";
import img5 from "../../assets/img/AuctionProductDetails/ProductImage/ipad-05.png";

export default function MediaGallery({ images }) {
  const fallback = useMemo(
    () => [
      { id: 1, url: img1, type: "image", alt: "상품 이미지 1" },
      { id: 2, url: img2, type: "image", alt: "상품 이미지 2" },
      { id: 3, url: img3, type: "image", alt: "상품 이미지 3" },
      { id: 4, url: img4, type: "image", alt: "상품 이미지 4" },
      { id: 5, url: img5, type: "image", alt: "상품 이미지 5" },
    ],
    []
  );

  const media = (images && images.length ? images : fallback).slice(0, 20);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  const current = media[index];
  const showThumbs = media.length > 1;

  const openLightbox = () => setOpen(true);
  const closeLightbox = () => setOpen(false);
  const prev = () => setIndex((i) => (i - 1 + media.length) % media.length);
  const next = () => setIndex((i) => (i + 1) % media.length);

  // ESC / 좌우 키, 바디 스크롤 잠금
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, media.length]);

  return (
    <div className={styles.gallery} aria-label="상품 미디어 갤러리">
      {/* 메인 뷰 */}
      <div
        className={styles.mainShot}
        onClick={openLightbox}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openLightbox()}
        aria-label="이미지 크게 보기"
      >
        {current?.type !== "video" ? (
          <img
            src={current?.url}
            alt={current?.alt || "상품 이미지"}
            className={styles.mainMedia}
            draggable="false"
          />
        ) : (
          <video className={styles.mainMedia} src={current.url} controls />
        )}

        {showThumbs && (
          <div className={styles.badge}>
            {index + 1} / {media.length}
          </div>
        )}
        <div className={styles.mainOverlay} />
      </div>

      {/* 썸네일(본문) */}
      {showThumbs && (
        <ul className={styles.thumbRow} role="listbox" aria-label="상품 이미지 썸네일">
          {media.map((m, i) => (
            <li key={m.id ?? i}>
              <button
                type="button"
                role="option"
                aria-selected={i === index}
                className={`${styles.thumb} ${i === index ? styles.active : ""}`}
                onClick={() => setIndex(i)}
                title={`이미지 ${i + 1}`}
              >
                {m.type !== "video" ? (
                  <img src={m.url} alt={m.alt || `썸네일 ${i + 1}`} />
                ) : (
                  <div className={styles.videoThumb}>VIDEO</div>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* ===== 전체 화면 라이트박스 (Portal) ===== */}
      {open &&
        createPortal(
          <div
            className={styles.lbBackdrop}
            role="dialog"
            aria-modal="true"
            aria-label="확대 이미지 보기"
            onClick={closeLightbox} // 배경 클릭 닫기
          >
            {/* 가운데 스테이지 */}
            <div
              className={styles.lbStage}
              onClick={(e) => e.stopPropagation()} // 내부 클릭은 유지
            >
              {/* 왼쪽/오른쪽 원형 화살표 */}
              {media.length > 1 && (
                <>
                  <button
                    type="button"
                    className={`${styles.lbArrow} ${styles.left}`}
                    aria-label="이전 이미지"
                    onClick={prev}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className={`${styles.lbArrow} ${styles.right}`}
                    aria-label="다음 이미지"
                    onClick={next}
                  >
                    ›
                  </button>
                </>
              )}

              {/* 닫기 버튼 */}
              <button
                type="button"
                className={styles.lbClose}
                aria-label="닫기"
                onClick={closeLightbox}
              >
                닫기
              </button>

              {/* 실제 이미지/영상 */}
              {current?.type !== "video" ? (
                <img
                  src={current?.url}
                  alt={current?.alt || "상품 이미지 확대"}
                  className={styles.lbMedia}
                  draggable="false"
                />
              ) : (
                <video className={styles.lbMedia} src={current.url} controls autoPlay />
              )}

              {/* 카운터 */}
              {showThumbs && (
                <div className={styles.lbCounter}>
                  {index + 1} / {media.length}
                </div>
              )}

              {/* 하단 썸네일 스트립 */}
              {showThumbs && (
                <div className={styles.lbThumbs}>
                  {media.map((m, i) => (
                    <button
                      key={m.id ?? i}
                      type="button"
                      className={`${styles.lbThumb} ${i === index ? styles.active : ""}`}
                      onClick={() => setIndex(i)}
                      aria-label={`미리보기 ${i + 1}`}
                      title={`이미지 ${i + 1}`}
                    >
                      {m.type !== "video" ? (
                        <img src={m.url} alt={m.alt || `미리보기 ${i + 1}`} />
                      ) : (
                        <span className={styles.videoPill}>VIDEO</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
