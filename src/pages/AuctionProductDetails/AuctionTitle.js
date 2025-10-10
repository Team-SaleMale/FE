import { memo } from "react";
import styles from "../../styles/AuctionProductDetails/AuctionTitle.module.css";
import ActionButtons from "./ActionButton";

/**
 * AuctionTitle
 * - API 연동/등록화면 미리보기 모두 호환되는 상단 헤더
 * - Controlled props(서버 상태) 우선, 없으면 기본값 처리
 *
 * Props
 *  - title: string               // 상품 제목
 *  - category: string            // 카테고리 라벨(또는 서버에서 온 라벨)
 *  - liked: boolean              // 찜 여부(제어형)
 *  - onToggleLike(next: boolean) // 찜 토글 핸들러
 *  - onShare()                   // 공유 핸들러(없으면 내부 기본 동작)
 *  - isLoading: boolean          // 스켈레톤 표시
 */
function AuctionTitle({
  title = "",
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
