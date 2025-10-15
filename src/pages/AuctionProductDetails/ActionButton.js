// 작은 아이콘형 액션 버튼(찜/공유) 묶음
// - 외부에서 isLiked, onToggleLike, onShare 전달 (없으면 내부 state로 폴백)
// - 접근성(a11y) 고려: aria-label, aria-pressed, 키보드 포커스 스타일
import { useState } from "react";
import { Icon } from "@iconify/react";
import styles from "../../styles/AuctionProductDetails/ActionButton.module.css";

export default function ActionButtons({
  isLiked: controlledLiked,
  onToggleLike,
  onShare,
  size = 22,
  gap = 12,
}) {
  const [uncontrolledLiked, setUncontrolledLiked] = useState(false);
  const liked = controlledLiked ?? uncontrolledLiked;

  const handleLike = () => {
    if (onToggleLike) onToggleLike(!liked);
    else setUncontrolledLiked((v) => !v);
  };

  const handleShare = async () => {
    if (onShare) return onShare();
    // 기본 동작: Web Share API 폴백 복사
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ url });
      } else {
        await navigator.clipboard.writeText(url);
        // eslint-disable-next-line no-alert
        alert("링크가 복사되었습니다.");
      }
    } catch (_) {
      // 사용자가 취소했거나 미지원
    }
  };

  return (
    <div className={styles.wrap} style={{ gap }}>
      <button
        type="button"
        className={`${styles.btn} ${liked ? styles.liked : ""}`}
        aria-label={liked ? "찜 해제" : "찜하기"}
        aria-pressed={liked}
        onClick={handleLike}
      >
        <Icon
          icon={liked ? "solar:heart-bold" : "solar:heart-linear"}
          width={size}
          height={size}
        />
      </button>

      <button
        type="button"
        className={styles.btn}
        aria-label="공유하기"
        onClick={handleShare}
      >
        <Icon icon="solar:share-linear" width={size} height={size} />
      </button>
    </div>
  );
}
