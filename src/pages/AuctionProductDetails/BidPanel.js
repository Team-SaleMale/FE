// src/pages/AuctionProductDetails/BidPanel.js
import { useEffect, useMemo, useState } from "react";
import styles from "../../styles/AuctionProductDetails/BidPanel.module.css";

/**
 * BidPanel
 * props:
 *  - price: { current, unitStep, startPrice }
 *  - calendar: { startDate, endDate }
 *  - bidItems: BidHistory 배열(길이로 참여자 수 계산, 최우선)
 *  - participants: 숫자(폴백1)
 *  - watchers: 숫자(metrics.watchers 등, 폴백2)
 *  - onBid: (price:number) => void
 */
export default function BidPanel({
  price,
  calendar,
  bidItems,
  participants,
  watchers,
  onBid,
}) {
  const [now, setNow] = useState(Date.now());
  const [raw, setRaw] = useState(""); // 숫자만 보관

  // 카운트다운: 일/시/분/초
  const countdown = useMemo(() => {
    if (!calendar?.endDate) return "-";
    const end = new Date(calendar.endDate).getTime();
    const diff = Math.max(end - now, 0);

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    const hh = String(h).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    const ss = String(s).padStart(2, "0");

    return `남은 시간: ${d}일 ${hh}:${mm}:${ss}`;
  }, [now, calendar?.endDate]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // 통화 포맷
  const fmtKRW = (n) =>
    typeof n === "number" ? `₩${n.toLocaleString("ko-KR")}` : "-";

  const unit = price?.unitStep ?? 1000;
  const minFromCurrent = (price?.current ?? 0) + unit;
  const minFromStart = price?.startPrice ?? 0;
  const absoluteMin = Math.max(minFromCurrent, minFromStart);

  // 현재 참여자 수: BidHistory 우선 → participants → watchers
  const participantsCount = useMemo(() => {
    if (Array.isArray(bidItems)) return bidItems.length;
    if (Number.isFinite(participants)) return participants;
    if (Number.isFinite(watchers)) return watchers;
    return null;
  }, [bidItems, participants, watchers]);

  // 입력 값(표시용은 콤마, 상태는 숫자 문자열)
  const displayValue = raw ? Number(raw).toLocaleString("ko-KR") : "";

  const onChangePrice = (e) => {
    const digits = e.target.value.replace(/[^\d]/g, "");
    setRaw(digits);
  };

  const numeric = raw ? Number(raw) : 0;
  const canBid = raw !== "" && numeric >= absoluteMin;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canBid) return;
    onBid?.(numeric);
    setRaw("");
  };

  return (
    <div className={styles.card}>
      {/* 상단: 시작/종료일 */}
      <div className={styles.row}>
        <div className={styles.block}>
          <div className={styles.label}>Start Day</div>
          <div className={styles.value}>{calendar?.startDate}</div>
        </div>
        <div className={styles.block}>
          <div className={styles.label}>End Day</div>
          <div className={styles.value}>{calendar?.endDate}</div>
        </div>
      </div>

      {/* 카운트다운 */}
      <div className={styles.countdown}>
        <div className={styles.cdLabel}>CountDown</div>
        <div className={styles.cdValue}>{countdown}</div>
      </div>

      {/* 현재 참여자 수 */}
      <div className={styles.section}>
        <div className={styles.h2}>현재 참여자 수</div>
        <div className={styles.kpi}>
          {participantsCount !== null
            ? `${participantsCount.toLocaleString("ko-KR")}명`
            : "-"}
        </div>
      </div>

      {/* 최소 가격 */}
      <div className={styles.section}>
        <div className={styles.h2}>최소 가격</div>
        <div className={styles.kpi}>{fmtKRW(absoluteMin)}</div>
      </div>

      {/* 희망가 입력 + CTA */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.inputLabel}>
          원하는 금액을 입력하세요 <span className={styles.required}>*</span>
        </label>

        <div className={styles.inputWrap}>
          <span className={styles.prefix}>₩</span>
          <input
            type="text"
            inputMode="numeric"
            className={styles.input}
            placeholder="Place Your Bid"
            value={displayValue}
            onChange={onChangePrice}
            aria-label="희망 입찰가"
          />
          <span className={styles.suffix}>원</span>
        </div>

        {raw !== "" && numeric < absoluteMin && (
          <div className={styles.helper}>
            {fmtKRW(absoluteMin)} 이상부터 입찰 가능해요.
          </div>
        )}

        <button className={styles.btn} type="submit" disabled={!canBid}>
          입찰하기
        </button>
      </form>
    </div>
  );
}
