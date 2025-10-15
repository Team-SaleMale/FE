import { memo } from "react";
import { Icon } from "@iconify/react";
import styles from "../../styles/AuctionProductDetails/AuctionTitle.module.css";
import ActionButtons from "./ActionButton";

/**
 * AuctionTitle
 * - 상단 헤더: 제목, 정확한 모델명(옵션), 카테고리, 액션버튼
 *
 * Props
 *  - title: string                      // 상품 제목
 *  - exactModelName?: string            // AI/정확 판정 모델명(있으면 제목 아래 표시)
 *  - category: string                   // 카테고리 라벨
 *  - liked: boolean                     // 찜 여부(제어형)
 *  - onToggleLike(next: boolean)        // 찜 토글 핸들러
 *  - onShare()                          // 공유 핸들러
 *  - isLoading: boolean                 // 스켈레톤 표시
 */
function AuctionTitle({
  title = "",
  exactModelName = "",     // ✅ 추가
  category = "",
  liked,
  onToggleLike,
  onShare,
  isLoading = false,
}) {
  if (isLoading) {
    return (
      <header className={styles.wrap} aria-busy="true">
        <div className={styles.left}>
          <div className={`${styles.skeleton} ${styles.titleSkel}`} />
          {/* 모델명 스켈레톤 추가 */}
          <div className={`${styles.skeleton} ${styles.modelSkel}`} />
          <div className={`${styles.skeleton} ${styles.catSkel}`} />
        </div>
        <div className={styles.actions}>
          <div className={`${styles.skeleton} ${styles.iconSkel}`} />
          <div className={`${styles.skeleton} ${styles.iconSkel}`} />
        </div>
      </header>
    );
  }

  return (
    <header className={styles.wrap}>
      <div className={styles.left}>
        <h1 className={styles.title} title={title}>
          {title || "제목 없음"}
        </h1>

        {/* ✅ 정확한 모델명 (있을 때만 노출) */}
        {exactModelName && (
          <div className={styles.modelRow} title={exactModelName}>
            <Icon icon="solar:shield-check-linear" width={18} height={18} className={styles.modelIcon} />
            <span className={styles.modelLabel}>정확한 모델명</span>
            <span className={styles.modelValue}>{exactModelName}</span>
          </div>
        )}

        <div className={styles.meta}>
          {category ? (
            <span className={styles.cat}>{category}</span>
          ) : (
            <span className={`${styles.cat} ${styles.catMuted}`}>카테고리 미지정</span>
          )}
        </div>
      </div>

      <div className={styles.actions}>
        <ActionButtons
          isLiked={liked}
          onToggleLike={onToggleLike}
          onShare={onShare}
          size={22}
          gap={12}
        />
      </div>
    </header>
  );
}

export default memo(AuctionTitle);
