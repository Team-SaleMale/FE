// 작은 아이콘형 액션 버튼(찜/공유) 묶음
// - itemId가 주어지면 내부에서 like/unlike API를 직접 호출 (낙관적 업데이트 + 롤백)
// - 외부에서 isLiked/likeCount/onToggleLike/onChange를 주면 해당 값을 우선 사용
import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import styles from "../../styles/AuctionProductDetails/ActionButton.module.css";
import { likeAuction, unlikeAuction } from "../../api/auctions/service";

export default function ActionButtons({
  itemId,
  isLiked: controlledLiked,
  likeCount: controlledCount,
  onToggleLike,
  onChange,
  onShare,
  size = 22,
  gap = 12,
}) {
  const [unLiked, setUnLiked] = useState(false);
  const [unCount, setUnCount] = useState(0);

  const liked = useMemo(() => (controlledLiked ?? unLiked), [controlledLiked, unLiked]);
  const count = useMemo(
    () => (typeof controlledCount === "number" ? controlledCount : unCount),
    [controlledCount, unCount]
  );

  const applyLocal = (nextLiked) => {
    const nextCount = Math.max(0, count + (nextLiked ? 1 : -1));
    if (controlledLiked === undefined) setUnLiked(nextLiked);
    if (controlledCount === undefined) setUnCount(nextCount);
    onChange?.({ isLiked: nextLiked, likeCount: nextCount });
  };

  const rollbackLocal = (prevLiked) => {
    if (controlledLiked === undefined) setUnLiked(prevLiked);
    if (controlledCount === undefined)
      setUnCount(Math.max(0, count + (prevLiked ? 1 : -1)));
  };

  const handleLike = async () => {
    const next = !liked;

    if (onToggleLike) {
      onToggleLike(next);
      onChange?.({ isLiked: next, likeCount: Math.max(0, count + (next ? 1 : -1)) });
      return;
    }

    if (!itemId) {
      applyLocal(next);
      return;
    }

    applyLocal(next);
    try {
      if (next) await likeAuction(itemId);
      else await unlikeAuction(itemId);
    } catch (e) {
      rollbackLocal(!next);
      console.error(e);
      alert("요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    }
  };

  const handleShare = async () => {
    if (onShare) return onShare();
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ url });
      } else {
        await navigator.clipboard.writeText(url);
        alert("링크가 복사되었습니다.");
      }
    } catch {}
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
        <Icon icon={liked ? "solar:heart-bold" : "solar:heart-linear"} width={size} height={size} />
      </button>

      <button type="button" className={styles.btn} aria-label="공유하기" onClick={handleShare}>
        <Icon icon="solar:share-linear" width={size} height={size} />
      </button>
    </div>
  );
}
