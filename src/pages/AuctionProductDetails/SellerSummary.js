// src/pages/AuctionProductDetails/SellerSummary.js
import { useMemo } from "react";
import { Icon } from "@iconify/react";
import styles from "../../styles/AuctionProductDetails/SellerSummary.module.css";
import defaultAvatar from "../../assets/img/AuctionProductDetails/ProfileImage/profile-07.png";

/**
 * seller:
 *  - name, avatarUrl, tradesCount
 *  - auctionScore: 0~5 (0.5단위)  ← API mannerScore(0~100)를 매핑해 전달됨
 */
export default function SellerSummary({ seller }) {
  const data = useMemo(() => {
    const fallback = {
      name: "ValueSeller",
      avatarUrl: defaultAvatar,
      tradesCount: 27,
      auctionScore: 4.5,
    };

    const merged = { ...fallback, ...(seller || {}) };

    // ✅ 거래 횟수를 랜덤 값으로 강제 설정 (예: 10 ~ 200 사이)
    const minTrades = 10;
    const maxTrades = 200;
    const randomTrades =
      Math.floor(Math.random() * (maxTrades - minTrades + 1)) + minTrades;

    return {
      ...merged,
      tradesCount: randomTrades,
    };
  }, [seller]);

  // ⭐ 별 계산: 0.5 단위 고정
  const score = Math.max(0, Math.min(5, Number(data.auctionScore) || 0));
  const rounded = Math.round(score * 2) / 2;
  const fullStars = Math.floor(rounded);
  const hasHalf = rounded - fullStars === 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <section className={styles.card} aria-label="판매자 정보">
      <h3 className={styles.title}>판매자 정보</h3>

      <div className={styles.headerRow}>
        <div className={styles.avatarWrap}>
          <img
            className={styles.avatar}
            src={data.avatarUrl || defaultAvatar}
            alt={`${data.name} 프로필 이미지`}
          />
        </div>

        <div className={styles.mainInfo}>
          <div className={styles.nameRow}>
            <strong className={styles.name}>{data.name}</strong>
          </div>

          <div className={styles.badgeRow}>
            <span className={styles.badge}>
              <Icon icon="solar:cart-3-linear" className={styles.badgeIcon} />
              거래 {Number(data.tradesCount).toLocaleString()}회
            </span>
            <span className={styles.badge}>
              <Icon icon="solar:tag-price-linear" className={styles.badgeIcon} />
              경매 지수 {rounded.toFixed(1)}
            </span>
          </div>

          <div className={styles.ratingRow} aria-label={`경매 지수 ${rounded.toFixed(1)}점`}>
            <div className={styles.stars}>
              {Array.from({ length: fullStars }).map((_, i) => (
                <Icon key={`full-${i}`} icon="ic:round-star" className={styles.starFull} />
              ))}
              {hasHalf && <Icon icon="ic:round-star-half" className={styles.starFull} />}
              {Array.from({ length: emptyStars }).map((_, i) => (
                <Icon key={`empty-${i}`} icon="ic:round-star-border" className={styles.starEmpty} />
              ))}
            </div>
            <span className={styles.scoreText}>{rounded.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
