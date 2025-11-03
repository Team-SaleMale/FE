// src/pages/AuctionProductDetails/AuctionTitle.js
import { memo } from "react";
import { Icon } from "@iconify/react";
import styles from "../../styles/AuctionProductDetails/AuctionTitle.module.css";
import ActionButtons from "./ActionButton";

/**
 * AuctionTitle
 * - 상단 헤더: 제목, 정확한 모델명(옵션), 카테고리, 액션버튼
 *
 * Props
 *  - title: string
 *  - exactModelName?: string
 *  - category?: string
 *  - itemId?: number|string                 // ✅ 찜 API 호출 위해 필요
 *  - isLiked?: boolean                      // ✅ 제어형 찜 여부
 *  - likeCount?: number                     // ✅ 제어형 찜 카운트
 *  - onLikeChange?: ({isLiked, likeCount}) => void  // ✅ 내부 상태 변경 알림
 *  - liked?: boolean                        // (하위호환) 기존 prop
 *  - onToggleLike?: (next:boolean)=>void    // (하위호환)
 *  - onShare?: () => void
 *  - isLoading?: boolean
 */
function AuctionTitle({
  title = "",
  exactModelName = "",
  category = "",
  itemId,
  isLiked,
  likeCount,
  onLikeChange,
  // 하위호환용 기존 prop
  liked,
  onToggleLike,
  onShare,
  isLoading = false,
}) {
  // 하위호환: isLiked가 정의되지 않았으면 liked 사용
  const likedValue = isLiked ?? liked ?? false;

  if (isLoading) {
    return (
      <header className={styles.wrap} aria-busy="true">
        <div className={styles.left}>
          <div className={`${styles.skeleton} ${styles.titleSkel}`} />
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

        {/* 정확한 모델명 (있을 때만 노출) */}
        {exactModelName && (
          <div className={styles.modelRow} title={exactModelName}>
            <Icon
              icon="solar:shield-check-linear"
              width={18}
              height={18}
              className={styles.modelIcon}
            />
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
          itemId={itemId}                 // ✅ API 호출 위해 전달
          isLiked={likedValue}            // ✅ 제어형 찜 상태
          likeCount={likeCount}           // ✅ 제어형 찜 카운트
          onChange={onLikeChange}         // ✅ 상태 변동 알림 (isLiked/likeCount)
          onToggleLike={onToggleLike}     // (옵션) 외부 제어 시 토글 콜백
          onShare={onShare}
          size={22}
          gap={12}
        />
      </div>
    </header>
  );
}

export default memo(AuctionTitle);
