import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import styles from "../../styles/AuctionProductDetails/ProductDescription.module.css";

/**
 * 판매자 설명 (2줄 초과 시 더보기 노출)
 * - 로딩/에러/빈값 처리
 * - 2줄 line-clamp + 실제 오버플로우 측정
 * - 신고 버튼 콜백 지원
 *
 * Props
 * - text: string | null
 * - updatedAt?: string | Date
 * - isLoading?: boolean
 * - error?: string | null
 * - onReport?: () => void
 */
export default function ProductDescription({
  text,
  updatedAt,
  isLoading = false,
  error = null,
  onReport,
}) {
  const [expanded, setExpanded] = useState(false);
  const [showMore, setShowMore] = useState(false); // 2줄 초과 여부
  const descRef = useRef(null);

  // iso/Date -> YYYY.MM.DD 포맷
  const formattedDate = useMemo(() => {
    if (!updatedAt) return null;
    const d = typeof updatedAt === "string" ? new Date(updatedAt) : updatedAt;
    if (isNaN(d?.getTime?.())) return null;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}.${mm}.${dd}`;
  }, [updatedAt]);

  // URL 자동 링크 처리
  const autoLinked = useMemo(() => {
    if (!text) return "";
    const safe = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    const withLinks = safe.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    return withLinks;
  }, [text]);

  // 2줄 초과 여부 측정 (desc가 clamp된 상태에서만 체크)
  useEffect(() => {
    if (!descRef.current) return;

    const el = descRef.current;

    const measure = () => {
      if (!el) return;
      // 접힌 상태에서만 line-clamp 적용되므로 그 상태에서 overflow 판정
      if (!expanded) {
        // 강제로 reflow 후 측정
        const overflowing = el.scrollHeight > el.clientHeight + 1; // 보정값 +1
        setShowMore(overflowing);
      } else {
        // 펼친 상태에서는 더보기 숨김 기준(접기 버튼만 노출)
        setShowMore(false);
      }
    };

    measure();

    // 크기 변화 대응(반응형): ResizeObserver 지원
    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(measure);
      ro.observe(el);
    } else {
      // 폴백: 리사이즈 리스너
      window.addEventListener("resize", measure);
    }

    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", measure);
    };
  }, [autoLinked, expanded]);

  return (
    <section className={styles.card} aria-labelledby="seller-desc-title">
      <div className={styles.header}>
        <h3 id="seller-desc-title" className={styles.title}>
          판매자 설명
        </h3>

        <div className={styles.actions}>
          {formattedDate && (
            <span className={styles.updatedAt} title="최근 수정일">
              <Icon icon="solar:calendar-linear" className={styles.icon} />
              {formattedDate}
            </span>
          )}
          <button
            type="button"
            className={styles.reportBtn}
            onClick={onReport}
            aria-label="신고하기"
          >
            <Icon icon="solar:shield-warning-linear" className={styles.icon} />
            신고
          </button>
        </div>
      </div>

      {/* 상태 처리 */}
      {isLoading ? (
        <div className={styles.skeleton} aria-busy="true" />
      ) : error ? (
        <div className={styles.error} role="alert">
          <Icon icon="solar:danger-triangle-linear" className={styles.icon} />
          {error}
        </div>
      ) : !text ? (
        <p className={styles.empty}>판매자 설명이 없습니다.</p>
      ) : (
        <>
          <p
            ref={descRef}
            className={`${styles.desc} ${!expanded ? styles.clamp2 : ""}`}
            dangerouslySetInnerHTML={{ __html: autoLinked }}
          />
          {!expanded && showMore && (
            <button
              type="button"
              className={styles.moreBtn}
              onClick={() => setExpanded(true)}
              aria-expanded={expanded}
            >
              더보기
              <Icon icon="solar:alt-arrow-down-linear" />
          </button>
          )}
          {expanded && (
            <button
              type="button"
              className={styles.moreBtn}
              onClick={() => setExpanded(false)}
              aria-expanded={expanded}
            >
              접기
              <Icon icon="solar:alt-arrow-up-linear" />
            </button>
          )}
        </>
      )}
    </section>
  );
}
