import { useMemo } from "react";
import { Icon } from "@iconify/react";
import styles from "../../styles/AuctionProductDetails/SellerSummary.module.css";

// 기본 프로필(더미) — API 연동 전까지 사용
import defaultAvatar from "../../assets/img/AuctionProductDetails/ProfileImage/profile-07.png";

/**
 * SellerSummary
 * - 당근 스타일의 심플한 판매자 카드
 * - props.seller 구조(예시):
 *   {
 *     name: "닉네임",
 *     avatarUrl: "이미지 경로",
 *     tradesCount: 123,       // 거래 회수
 *     auctionScore: 4.5       // 경매 지수(0~5, 소수 1자리)
 *   }
 */
export default function SellerSummary({ seller }) {
  const data = useMemo(() => {
    const fallback = {
      name: "ValueSeller",
      avatarUrl: defaultAvatar,
      tradesCount: 27,
      auctionScore: 4.5,
    };
    return { ...fallback, ...(seller || {}) };
  }, [seller]);

  const fullStars = Math.floor(data.auctionScore);
  const hasHalf = data.auctionScore - fullStars >= 0.25 && data.auctionScore - fullStars < 0.75;
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
            {/* 필요 시 인증/뱃지 아이콘 확장 가능 */}
          </div>

          <div className={styles.badgeRow}>
            <span className={styles.badge}>
              <Icon icon="solar:cart-3-linear" className={styles.badgeIcon} />
              거래 {Number(data.tradesCount).toLocaleString()}회
            </span>
            <span className={styles.badge}>
              <Icon icon="solar:tag-price-linear" className={styles.badgeIcon} />
              경매 지수 {data.auctionScore.toFixed(1)}
            </span>
          </div>

          <div className={styles.ratingRow} aria-label={`경매 지수 ${data.auctionScore.toFixed(1)}점`}>
            <div className={styles.stars}>
              {Array.from({ length: fullStars }).map((_, i) => (
                <Icon key={`full-${i}`} icon="ic:round-star" className={styles.starFull} />
              ))}
              {hasHalf && <Icon icon="ic:round-star-half" className={styles.starFull} />}
              {Array.from({ length: emptyStars }).map((_, i) => (
                <Icon key={`empty-${i}`} icon="ic:round-star-border" className={styles.starEmpty} />
              ))}
            </div>
            <span className={styles.scoreText}>{data.auctionScore.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

