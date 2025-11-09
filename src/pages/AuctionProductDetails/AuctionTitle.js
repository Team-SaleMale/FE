import { memo } from "react";
import { Icon } from "@iconify/react";
import styles from "../../styles/AuctionProductDetails/AuctionTitle.module.css";
import ActionButtons from "./ActionButton"; // ✅ 파일명 수정

function AuctionTitle({
  title = "",
  exactModelName = "",
  category = "",
  itemId,
  isLiked,
  likeCount,
  onLikeChange,
  liked,          // 하위호환
  onToggleLike,   // 하위호환
  onShare,
  isLoading = false,
}) {
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
        <h1 className={styles.title} title={title}>{title || "제목 없음"}</h1>

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
          itemId={itemId}
          isLiked={likedValue}
          likeCount={likeCount}
          onChange={onLikeChange}
          onShare={onShare}
        />
      </div>
    </header>
  );
}

export default memo(AuctionTitle);
