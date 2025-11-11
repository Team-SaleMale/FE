import { useEffect, useMemo, useState } from "react";
import styles from "../../styles/AuctionProductDetails/BidPanel.module.css";

/** yyyy-mm-dd + HH:mm(:ss) -> ms */
function toDateTimeMs(dateStr, timeStr, fallback = "23:59:59") {
  if (!dateStr) return null;
  const [h, mi, s = "00"] = ((timeStr && timeStr.trim()) ? timeStr : fallback).split(":").map(Number);
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d, h || 0, mi || 0, s || 0, 0);
  return dt.getTime();
}

export default function BidPanel({
  price,       // { current, unitStep, startPrice }
  calendar,    // { startDate, endDate, startTime?, endTime? }
  bidItems,
  participants,
  watchers,
  onBid,
}) {
  const [now, setNow] = useState(Date.now());
  const [raw, setRaw] = useState("");

  // 카운트다운(종료 "날짜+시간" 기준)
  const countdown = useMemo(() => {
    const endMs = toDateTimeMs(calendar?.endDate, calendar?.endTime);
    if (!endMs) return "-";
    const diff = Math.max(endMs - now, 0);

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    const hh = String(h).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    const ss = String(s).padStart(2, "0");
    return `남은 시간: ${d}일 ${hh}:${mm}:${ss}`;
  }, [now, calendar?.endDate, calendar?.endTime]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const fmtKRW = (n) => (typeof n === "number" ? `₩${n.toLocaleString("ko-KR")}` : "-");

  const startPrice = Number(price?.startPrice ?? 0);
  const current    = Number(price?.current ?? 0);
  const step       = Number(price?.unitStep ?? 0);

  // 서버 규칙: 최소 입찰가 = max(현재가, 시작가) + 최소호가
  const effectiveCurrent = Math.max(current, startPrice);
  const minAllowed = effectiveCurrent + (step > 0 ? step : 0);

  const participantsCount = useMemo(() => {
    if (Array.isArray(bidItems)) return bidItems.length;
    if (Number.isFinite(participants)) return participants;
    if (Number.isFinite(watchers)) return watchers;
    return null;
  }, [bidItems, participants, watchers]);

  const onChangePrice = (e) => {
    const digits = e.target.value.replace(/[^\d]/g, "");
    setRaw(digits);
  };
  const numeric = raw ? Number(raw) : 0;
  const canBid = raw !== "" && numeric >= minAllowed;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canBid) return;
    onBid?.(numeric);
    setRaw("");
  };

  return (
    <div className={styles.card}>
      {/* 시작/종료: 날짜 + 시간 */}
      <div className={styles.row}>
        <div className={styles.block}>
          <div className={styles.label}>Start Day</div>
          <div className={styles.value}>{calendar?.startDate}</div>
          <div className={styles.time}>{calendar?.startTime ?? "00:00"}</div>
        </div>
        <div className={styles.block}>
          <div className={styles.label}>End Day</div>
          <div className={styles.value}>{calendar?.endDate}</div>
          <div className={styles.time}>{calendar?.endTime ?? "23:59"}</div>
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
          {participantsCount !== null ? `${participantsCount.toLocaleString("ko-KR")}명` : "-"}
        </div>
      </div>

      {/* 시작가 */}
      <div className={styles.section}>
        <div className={styles.h2}>시작가</div>
        <div className={styles.kpi}>{fmtKRW(startPrice)}</div>
      </div>

      {/* 희망가 입력 */}
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
            value={raw ? Number(raw).toLocaleString("ko-KR") : ""}
            onChange={onChangePrice}
            aria-label="희망 입찰가"
          />
          <span className={styles.suffix}>원</span>
        </div>

        {raw !== "" && numeric < minAllowed && (
          <div className={styles.helper}>
            {`${fmtKRW(minAllowed)} 이상부터 입찰 가능해요. (현재가 ${fmtKRW(effectiveCurrent)}, 최소호가 ${fmtKRW(step)})`}
          </div>
        )}

        <button className={styles.btn} type="submit" disabled={!canBid}>
          입찰하기
        </button>
      </form>
    </div>
  );
}
