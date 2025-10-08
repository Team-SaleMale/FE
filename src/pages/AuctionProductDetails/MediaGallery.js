import { useMemo, useState } from "react";
import styles from "../../styles/AuctionProductDetails/MediaGallery.module.css";

/** 더미 이미지 (API 연동 전) */
import img1 from "../../assets/img/AuctionProductDetails/ProductImage/ipad-01.png";
import img2 from "../../assets/img/AuctionProductDetails/ProductImage/ipad-02.png";
import img3 from "../../assets/img/AuctionProductDetails/ProductImage/ipad-03.png";
import img4 from "../../assets/img/AuctionProductDetails/ProductImage/ipad-04.png";
import img5 from "../../assets/img/AuctionProductDetails/ProductImage/ipad-05.png";

/**
 * props.images(optional): [{ id?:string|number, url:string, type?:'image'|'video', alt?:string }]
 */
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

  const media = (images && images.length ? images : fallback).slice(0, 10);
  const [index, setIndex] = useState(0);
  const current = media[index];
  const showThumbs = media.length > 1; // 1장일 때 썸네일/배지 숨김

  return (
    <div className={styles.wrap} aria-label="상품 미디어 갤러리">
      {/* 메인 뷰 */}
      <div className={styles.main}>
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
      </div>

      {/* 썸네일 (여러 장일 때만 노출) */}
      {showThumbs && (
        <div className={styles.thumbRow} role="listbox" aria-label="상품 이미지 썸네일">
          {media.map((m, i) => (
            <button
              type="button"
              key={m.id ?? i}
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
          ))}
        </div>
      )}
    </div>
  );
}
