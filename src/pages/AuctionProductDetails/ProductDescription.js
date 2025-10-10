import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import styles from "../../styles/AuctionProductDetails/ProductDescription.module.css";

/**
 * 판매자 설명 (API 연동 대비)
 * - 로딩/에러/빈값 처리
 * - 더보기/접기
 * - 신고 버튼 콜백 지원
 *
 * Props
 * - text: string | null          // 판매자 설명 텍스트
 * - updatedAt?: string | Date    // 최근 수정 시각(ISO string 가능)
 * - isLoading?: boolean
 * - error?: string | null
 * - maxChars?: number            // 접기 상태에서 보여줄 글자 수 (기본 220)
 * - onReport?: () => void        // 신고 버튼 클릭 콜백
 */
export default function ProductDescription({
  text,
  updatedAt,
  isLoading = false,
  error = null,
  maxChars = 220,
  onReport,
}) {
  const [expanded, setExpanded] = useState(false);

  // iso/Date -> YYYY.MM.DD 포맷 간단 처리
  const formattedDate = useMemo(() => {
    if (!updatedAt) return null;
    const d = typeof updatedAt === "string" ? new Date(updatedAt) : updatedAt;
    if (isNaN(d?.getTime?.())) return null;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}.${mm}.${dd}`;
  }, [updatedAt]);

  // URL 자동 링크 처리(간단 버전)
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

  // 더보기/접기용 텍스트
  const { displayHtml, isTruncated } = useMemo(() => {
    if (!autoLinked) return { displayHtml: "", isTruncated: false };
    if (expanded || autoLinked.length <= maxChars) {
      return { displayHtml: autoLinked, isTruncated: false };
    }
    return {
      displayHtml: autoLinked.slice(0, maxChars) + "…",
      isTruncated: true,
    };
  }, [autoLinked, expanded, maxChars]);

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
            className={styles.desc}
            dangerouslySetInnerHTML={{ __html: displayHtml }}
          />
          {isTruncated && (
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
          {expanded && autoLinked.length > maxChars && (
            <button
              type="button"
              className={styles.moreBtn}
              onClick={() => setExpanded(false)}
              aria-expanded={expanded}
            >
              접기
              <Icon icon="solar:alt-arrow-up-line-duotone" />
            </button>
          )}
        </>
      )}
    </section>
  );
}
