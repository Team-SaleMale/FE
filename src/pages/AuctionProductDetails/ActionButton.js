import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import styles from "../../styles/AuctionProductDetails/ActionButton.module.css";
import { likeAuction, unlikeAuction } from "../../api/auctions/service";

/**
 * 하트(찜) + 공유 버튼
 * - 낙관적 토글 → 실패/특정 에러코드에 따라 보정
 * - isLiked/likeCount 전달 시 제어형처럼 동작(동기화 useEffect)
 */
export default function ActionButtons({
  itemId,
  isLiked: controlledLiked,
  likeCount: controlledCount,
  onChange,     // ({ isLiked, likeCount })
  onShare,
  size = 22,
  gap = 12,
}) {
  // 로컬 즉시반응 상태
  const [localLiked, setLocalLiked] = useState(!!controlledLiked);
  const [localCount, setLocalCount] = useState(
    typeof controlledCount === "number" ? controlledCount : 0
  );

  // 🔄 외부 값과 동기화 (초기 렌더 이후에도 반영)
  useEffect(() => {
    if (typeof controlledLiked === "boolean") setLocalLiked(controlledLiked);
  }, [controlledLiked]);
  useEffect(() => {
    if (typeof controlledCount === "number") setLocalCount(controlledCount);
  }, [controlledCount]);

  const liked = useMemo(
    () => (typeof controlledLiked === "boolean" ? controlledLiked : localLiked),
    [controlledLiked, localLiked]
  );
  const count = useMemo(
    () => (typeof controlledCount === "number" ? controlledCount : localCount),
    [controlledCount, localCount]
  );

  const apply = (next) => {
    const nextCount = Math.max(0, count + (next ? 1 : -1));
    if (controlledLiked === undefined) setLocalLiked(next);
    if (controlledCount === undefined) setLocalCount(nextCount);
    onChange?.({ isLiked: next, likeCount: nextCount });
  };

  const force = (next) => {
    // 서버 판단으로 상태를 '강제 일치'
    const nextCount = Math.max(0, (typeof controlledCount === "number" ? controlledCount : localCount) + (next ? 1 : -1));
    if (controlledLiked === undefined) setLocalLiked(next);
    if (controlledCount === undefined) setLocalCount(next ? nextCount : Math.max(0, nextCount));
    onChange?.({ isLiked: next, likeCount: next ? nextCount : Math.max(0, nextCount) });
  };

  const rollback = (prev) => {
    if (controlledLiked === undefined) setLocalLiked(prev);
    if (controlledCount === undefined) {
      const prevCount = Math.max(0, count + (prev ? 1 : -1));
      setLocalCount(prevCount);
      onChange?.({ isLiked: prev, likeCount: prevCount });
    } else {
      onChange?.({ isLiked: prev, likeCount: controlledCount });
    }
  };

  const onClickLike = async () => {
    const prev = liked;
    const next = !prev;

    apply(next); // 낙관적 반영

    if (!itemId) return; // 프리뷰 등

    try {
      if (next) {
        const res = await likeAuction(itemId); // POST /auctions/{id}/liked
        // API가 200이더라도 isSuccess=false 가능
        if (res?.isSuccess === false) {
          // 이미 찜한 상태(서버 true) → UI도 true로 보정
          if (String(res.code) === "ITEM4003") {
            force(true);
            return;
          }
          rollback(prev);
          alert(res?.message || "찜 처리에 실패했습니다.");
        }
      } else {
        const res = await unlikeAuction(itemId); // DELETE /auctions/{id}/liked
        if (res?.isSuccess === false) {
          // 이미 미찜 상태(서버 false) → UI도 false로 보정
          if (String(res.code) === "ITEM4004") {
            force(false);
            return;
          }
          rollback(prev);
          alert(res?.message || "찜 해제에 실패했습니다.");
        }
      }
    } catch (e) {
      // axios 에러 응답에서도 같은 보정
      const d = e?.response?.data;
      if (d?.isSuccess === false) {
        if (String(d.code) === "ITEM4003") { force(true); return; }
        if (String(d.code) === "ITEM4004") { force(false); return; }
      }
      rollback(prev);
      console.error(e);
      alert("요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    }
  };

  const onClickShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ url });
      else {
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
        onClick={onClickLike}
      >
        <Icon icon={liked ? "solar:heart-bold" : "solar:heart-linear"} width={size} height={size} />
      </button>

      <button type="button" className={styles.btn} aria-label="공유하기" onClick={onClickShare}>
        <Icon icon="solar:share-linear" width={size} height={size} />
      </button>
    </div>
  );
}
