// src/pages/AuctionRegistration/PriceSuggestionModal.js
// 가격 추천 흐름을 "모달 + (네이버 시세 그래프) + (추천가 적용)" 형태로 제공해 사용자 대기 스트레스를 줄입니다.

import React, { useMemo } from "react";
import { createPortal } from "react-dom";
import styles from "../../styles/AuctionRegistration/PriceSuggestionModal.module.css";

function formatWon(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "-";
  return num.toLocaleString("ko-KR");
}

function parsePricesFromNaver(items = []) {
  // 네이버 응답의 lprice는 문자열인 경우가 많음: "899000"
  const prices = (items || [])
    .map((it) => Number(String(it?.lprice ?? "").replace(/[^\d]/g, "")))
    .filter((v) => Number.isFinite(v) && v > 0);
  return prices;
}

function buildHistogram(prices, bins = 7) {
  if (!prices.length) {
    return { bins: [], min: 0, max: 0, avg: 0, median: 0 };
  }

  const sorted = [...prices].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const avg = Math.round(sorted.reduce((s, v) => s + v, 0) / sorted.length);
  const median =
    sorted.length % 2 === 1
      ? sorted[(sorted.length - 1) / 2]
      : Math.round((sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2);

  if (min === max) {
    return {
      min,
      max,
      avg,
      median,
      bins: [
        {
          label: `${formatWon(min)}원`,
          from: min,
          to: max,
          count: sorted.length,
        },
      ],
    };
  }

  const width = (max - min) / bins;
  const out = Array.from({ length: bins }, (_, i) => {
    const from = min + width * i;
    const to = i === bins - 1 ? max : min + width * (i + 1);
    return { from, to, count: 0 };
  });

  for (const p of sorted) {
    const idx = Math.min(bins - 1, Math.floor((p - min) / width));
    out[idx].count += 1;
  }

  const labeled = out.map((b, i) => {
    const fromLabel = Math.round(b.from / 1000) * 1000;
    const toLabel = Math.round(b.to / 1000) * 1000;
    return {
      ...b,
      label:
        i === out.length - 1
          ? `${formatWon(fromLabel)}~${formatWon(toLabel)}`
          : `${formatWon(fromLabel)}~${formatWon(toLabel)}`,
    };
  });

  return { min, max, avg, median, bins: labeled };
}

function BarChart({ histogram }) {
  const maxCount = Math.max(1, ...histogram.bins.map((b) => b.count));

  return (
    <div className={styles.chartWrap}>
      <div className={styles.chartBars}>
        {histogram.bins.map((b, idx) => {
          const hPct = Math.round((b.count / maxCount) * 100);
          return (
            <div key={`${b.label}-${idx}`} className={styles.barCol}>
              <div className={styles.barTop}>{b.count || 0}</div>
              <div className={styles.barTrack}>
                <div className={styles.barFill} style={{ height: `${hPct}%` }} />
              </div>
              <div className={styles.barLabel}>{b.label}</div>
            </div>
          );
        })}
      </div>
      <div className={styles.chartHint}>
        * 네이버 쇼핑 검색 결과의 가격(lprice) 기준 간단 분포입니다.
      </div>
    </div>
  );
}

export default function PriceSuggestionModal({
  open,
  onClose,
  productName,

  // 네이버(빠름)
  naverResponse,
  naverLoading,
  naverError,

  // 추천가(느림)
  suggestionResponse,
  suggestionLoading,
  suggestionError,

  onApplyRecommended,
}) {
  const items = naverResponse?.items || naverResponse?.result?.items || [];
  const prices = useMemo(() => parsePricesFromNaver(items), [items]);
  const histogram = useMemo(() => buildHistogram(prices, 7), [prices]);

  const suggestedPrice =
    suggestionResponse?.result?.recommendedPrice ??
    suggestionResponse?.recommendedPrice ??
    null;

  const suggestionMsg =
    suggestionResponse?.result?.message ?? suggestionResponse?.message ?? "";

  if (!open) return null;

  return createPortal(
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.header}>
          <div>
            <div className={styles.title}>가격 추천 분석</div>
            <div className={styles.subTitle}>
              상품명: <b>{productName || "-"}</b>
            </div>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.noticeBox}>
            <div className={styles.noticeTitle}>안내</div>
            <ul className={styles.noticeList}>
              <li>네이버 쇼핑 시세를 먼저 불러와 그래프로 보여드립니다.</li>
              <li>
                서버의 <b>가격 추천 API</b>는 데이터 분석으로 시간이 조금 걸릴 수 있어요. 잠시만 기다려주세요.
              </li>
            </ul>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHead}>
              <div className={styles.sectionTitle}>1) 네이버 시세(빠른 결과)</div>
              <div className={styles.badgeRow}>
                {naverLoading ? (
                  <span className={`${styles.badge} ${styles.badgeLoading}`}>불러오는 중…</span>
                ) : naverError ? (
                  <span className={`${styles.badge} ${styles.badgeError}`}>실패</span>
                ) : (
                  <span className={`${styles.badge} ${styles.badgeOk}`}>완료</span>
                )}
              </div>
            </div>

            {naverError ? (
              <div className={styles.errorBox}>
                네이버 시세를 불러오지 못했습니다. ({String(naverError)})
              </div>
            ) : (
              <>
                <div className={styles.statRow}>
                  <div className={styles.stat}>
                    <div className={styles.statLabel}>최저</div>
                    <div className={styles.statValue}>{formatWon(histogram.min)}원</div>
                  </div>
                  <div className={styles.stat}>
                    <div className={styles.statLabel}>평균</div>
                    <div className={styles.statValue}>{formatWon(histogram.avg)}원</div>
                  </div>
                  <div className={styles.stat}>
                    <div className={styles.statLabel}>중앙값</div>
                    <div className={styles.statValue}>{formatWon(histogram.median)}원</div>
                  </div>
                  <div className={styles.stat}>
                    <div className={styles.statLabel}>최고</div>
                    <div className={styles.statValue}>{formatWon(histogram.max)}원</div>
                  </div>
                </div>

                {prices.length > 0 ? (
                  <BarChart histogram={histogram} />
                ) : (
                  <div className={styles.emptyBox}>
                    네이버 시세 데이터(가격)가 부족해 그래프를 만들 수 없어요.
                  </div>
                )}
              </>
            )}
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHead}>
              <div className={styles.sectionTitle}>2) 서버 가격 추천(느린 분석)</div>
              <div className={styles.badgeRow}>
                {suggestionLoading ? (
                  <span className={`${styles.badge} ${styles.badgeLoading}`}>분석 중…</span>
                ) : suggestionError ? (
                  <span className={`${styles.badge} ${styles.badgeError}`}>실패</span>
                ) : suggestedPrice != null ? (
                  <span className={`${styles.badge} ${styles.badgeOk}`}>완료</span>
                ) : (
                  <span className={`${styles.badge} ${styles.badgeMuted}`}>대기</span>
                )}
              </div>
            </div>

            {suggestionError ? (
              <div className={styles.errorBox}>
                가격 추천 분석에 실패했습니다. ({String(suggestionError)})
              </div>
            ) : suggestedPrice != null ? (
              <div className={styles.recoBox}>
                <div className={styles.recoLabel}>추천 시작가</div>
                <div className={styles.recoValue}>₩ {formatWon(suggestedPrice)}</div>
                {suggestionMsg ? <div className={styles.recoDesc}>{suggestionMsg}</div> : null}

                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.applyBtn}
                    onClick={() => onApplyRecommended?.(String(suggestedPrice))}
                  >
                    이 가격 적용
                  </button>
                  <button type="button" className={styles.secondaryBtn} onClick={onClose}>
                    닫기
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.waitBox}>
                {suggestionLoading
                  ? "가격 추천 결과를 계산 중입니다…"
                  : "아직 가격 추천 요청이 시작되지 않았습니다."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
