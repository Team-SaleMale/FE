import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import styles from "../../styles/AuctionProductDetails/AuctionMetrics.module.css";

/**
 * AuctionMetrics
 * - tradeMethod: "직거래/택배거래/기타" 또는 ["직거래","택배거래","기타"]
 * - 기타 상세: metrics.tradeOther | tradeEtc | tradeEtcDetail | tradeNote
 */
export default function AuctionMetrics({ metrics, loading = false, className = "" }) {
  const [etcOpen, setEtcOpen] = useState(false);
  const fmt = (n) => (typeof n === "number" ? n.toLocaleString() : "0");

  /** 거래방식 배열 + 기타 상세 */
  const { methods, etcDetail } = useMemo(() => {
    const raw = metrics?.tradeMethod;
    const list = Array.isArray(raw)
      ? raw
      : typeof raw === "string"
      ? raw.split("/").map((s) => s.trim()).filter(Boolean)
      : [];

    const etc =
      metrics?.tradeOther ||
      metrics?.tradeEtc ||
      metrics?.tradeEtcDetail ||
      metrics?.tradeNote ||
      "";

    return { methods: list, etcDetail: typeof etc === "string" ? etc.trim() : "" };
  }, [metrics]);

  /** 기타 상세를 보기 좋은 리스트로 파싱 */
  const etcItems = useMemo(() => {
    if (!etcDetail) return [];
    // 구분자: '•' / 줄바꿈 / 세미콜론
    return etcDetail
      .split(/[\u2022\n;]+/g)
      .map((s) => s.replace(/^[•\s]+/, "").trim())
      .filter(Boolean);
  }, [etcDetail]);

  const hasEtc = methods.some((m) => /기타/.test(m)) && !!etcDetail;
  const etcCardId = "trade-etc-card";

  return (
    <div className={`${styles.card} ${className}`}>
      <h3 className={styles.title}>경매 상품 정보</h3>

      <ul className={styles.grid} aria-label="auction-metrics">
        {/* 조회 */}
        <li className={styles.item}>
          <div className={styles.left}>
            <span className={styles.iconWrap}>
              <Icon icon="solar:monitor-smartphone-linear" className={styles.icon} />
            </span>
            <span className={styles.label}>조회</span>
          </div>
          <b className={styles.value}>{loading ? <i className={styles.skel} /> : fmt(metrics?.views)}</b>
        </li>

        {/* 관심 */}
        <li className={styles.item}>
          <div className={styles.left}>
            <span className={styles.iconWrap}>
              <Icon icon="solar:heart-angle-linear" className={styles.icon} />
            </span>
            <span className={styles.label}>관심</span>
          </div>
          <b className={styles.value}>{loading ? <i className={styles.skel} /> : fmt(metrics?.watchers)}</b>
        </li>

        {/* 입찰 */}
        <li className={styles.item}>
          <div className={styles.left}>
            <span className={styles.iconWrap}>
              <Icon icon="solar:chat-round-dots-linear" className={styles.icon} />
            </span>
            <span className={styles.label}>입찰</span>
          </div>
          <b className={styles.value}>{loading ? <i className={styles.skel} /> : fmt(metrics?.bids)}</b>
        </li>

        {/* 거래방식 — 한 줄 텍스트 + 기타 클릭 토글 카드 */}
        <li className={styles.item}>
          <div className={styles.left}>
            <span className={styles.iconWrap}>
              <Icon icon="solar:plain-3-linear" className={styles.icon} />
            </span>
            <span className={styles.label}>거래방식</span>
          </div>

          {loading ? (
            <b className={styles.value}><i className={styles.skel} /></b>
          ) : methods.length ? (
            <>
              {/* 한 줄 표시(ellipsis) */}
              <b
                className={`${styles.value} ${styles.valueMethods}`}
                title={methods.join(", ")} /* 기본 툴팁으로 전체 값 확인 */
              >
                {methods.map((m, i) => {
                  const isEtc = /기타/.test(m) && !!etcDetail;
                  // 기타일 때는 클릭 가능한 버튼으로
                  return (
                    <span key={`${m}-${i}`} className={styles.inlineGroup}>
                      {isEtc ? (
                        <button
                          type="button"
                          className={styles.etcButton}
                          aria-expanded={etcOpen}
                          aria-controls={etcCardId}
                          onClick={() => setEtcOpen((v) => !v)}
                          title="기타 상세 보기"
                        >
                          {m}
                          <Icon
                            icon={etcOpen ? "solar:alt-arrow-up-linear" : "solar:alt-arrow-down-linear"}
                            className={styles.etcCaret}
                          />
                        </button>
                      ) : (
                        <span className={styles.valueText}>{m}</span>
                      )}
                      {i < methods.length - 1 && <span className={styles.comma}>, </span>}
                    </span>
                  );
                })}
              </b>

              {/* 기타 상세 카드(아래에 펼쳐짐) */}
              {hasEtc && (
                <div
                  id={etcCardId}
                  className={`${styles.etcCard} ${etcOpen ? styles.show : ""}`}
                  aria-hidden={!etcOpen}
                >
                  <div className={styles.etcCardHeader}>
                    <Icon icon="solar:info-circle-linear" className={styles.etcCardIcon} />
                    <span className={styles.etcCardTitle}>기타 안내</span>
                  </div>

                  {etcItems.length > 0 ? (
                    <ul className={styles.etcList}>
                      {etcItems.map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.etcTextBody}>{etcDetail}</p>
                  )}
                </div>
              )}
            </>
          ) : (
            <span className={styles.dim}>정보 없음</span>
          )}
        </li>
      </ul>
    </div>
  );
}
