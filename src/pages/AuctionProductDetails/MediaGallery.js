import { useEffect, useMemo, useState } from "react";
import styles from "../../styles/AuctionProductDetails/MediaGallery.module.css";

/**
 * props.images(optional): [{ id?:string|number, url:string, type?:'image'|'video', alt?:string }]
 * props.asideWidth(optional): 오른쪽 입찰 패널 포함 여백 폭(px). 기본 460
 * - 없는 경우 로컬 더미 5장 사용
 */
import img1 from "../../assets/img/AuctionProductDetails/ProductImage/ipad-01.png";
import img2 from "../../assets/img/AuctionProductDetails/ProductImage/ipad-02.png";
import img3 from "../../assets/img/AuctionProductDetails/ProductImage/ipad-03.png";
import img4 from "../../assets/img/AuctionProductDetails/ProductImage/ipad-04.png";
import img5 from "../../assets/img/AuctionProductDetails/ProductImage/ipad-05.png";

export default function MediaGallery({ images, asideWidth = 460 }) {
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

  const media = (images && images.length ? images : fallback).slice(0, 10);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  const current = media[index];
  const showThumbs = media.length > 1;

  const openDock = () => setOpen(true);
  const closeDock = () => setOpen(false);

  // ESC 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && closeDock();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className={styles.gallery} aria-label="상품 미디어 갤러리">
      {/* 메인 뷰: 프레임 고정(크롭 허용) */}
      <div
        className={styles.mainShot}
        onClick={openDock}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openDock()}
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

      {/* 썸네일 */}
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
                  <img src={m.url} alt={m.alt || `썸ने일 ${i + 1}`} />
                ) : (
                  <div className={styles.videoThumb}>VIDEO</div>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* 좌측 도킹 확대 뷰 (오른쪽 패널 폭만큼 비워둠) */}
      {open && (
        <div
          className={styles.dock}
          style={{ "--aside-w": `${asideWidth}px` }}
          role="dialog"
          aria-modal="true"
          aria-label="확대 이미지 보기"
        >
          <div className={styles.dockInner}>
            <button
              type="button"
              className={styles.dockClose}
              aria-label="닫기"
              onClick={closeDock}
            >
              ×
            </button>

            <div className={styles.dockStage}>
              {current?.type !== "video" ? (
                <img
                  src={current?.url}
                  alt={current?.alt || "상품 이미지 확대"}
                  className={styles.dockMedia}
                  draggable="false"
                />
              ) : (
                <video className={styles.dockMedia} src={current.url} controls autoPlay />
              )}
            </div>

            {showThumbs && (
              <div className={styles.dockCounter}>
                {index + 1} / {media.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
