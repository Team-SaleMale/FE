// src/pages/AuctionProductDetails/BidPanel.js
import { useEffect, useMemo, useState } from "react";
import styles from "../../styles/AuctionProductDetails/BidPanel.module.css";

/** yyyy-mm-dd + HH:mm(:ss) -> ms */
function toDateTimeMs(dateStr, timeStr, fallback = "23:59:59") {
  if (!dateStr) return null;
  const [h, mi, s = "00"] = (
    (timeStr && timeStr.trim()) ? timeStr : fallback
  ).split(":").map(Number);
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d, h || 0, mi || 0, s || 0, 0);
  return dt.getTime();
}

export default function BidPanel({
  price,       // { current, unitStep, startPrice }
  calendar,    // { endDate, endTime? } - 남은 시간 계산용
  bidItems,
  participants,
  watchers,
  onBid,
}) {
  const [now, setNow] = useState(Date.now());
  const [raw, setRaw] = useState("");
  const [isMinSelected, setIsMinSelected] = useState(false);

  // 남은 시간 타이머
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const countdownText = useMemo(() => {
    const endMs = toDateTimeMs(calendar?.endDate, calendar?.endTime);
    if (!endMs) return null;

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

  const fmtKRW = (n) =>
    typeof n === "number" ? `₩${n.toLocaleString("ko-KR")}` : "-";

  const startPrice = Number(price?.startPrice ?? 0);
  const current    = Number(price?.current ?? 0);
  const step       = Number(price?.unitStep ?? 0);

  // 현재가·최소 입찰가
  const effectiveCurrent = Math.max(current, startPrice);
  const minAllowed = effectiveCurrent + (step > 0 ? step : 0);

  // 최초 진입 시 최소가 자동 세팅
  useEffect(() => {
    if (minAllowed > 0 && raw === "") {
      setRaw(String(minAllowed));
      setIsMinSelected(true);
    }
  }, [minAllowed, raw]);

  // 참여자 수
  const participantsCount = useMemo(() => {
    if (Array.isArray(bidItems)) return bidItems.length;
    if (Number.isFinite(participants)) return participants;
    if (Number.isFinite(watchers)) return watchers;
    return null;
  }, [bidItems, participants, watchers]);

  // 입력 처리
  const onChangePrice = (e) => {
    const digits = e.target.value.replace(/[^\d]/g, "");
    setRaw(digits);
    setIsMinSelected(false);
  };

  const numeric = raw ? Number(raw) : 0;
  const canBid = raw !== "" && numeric >= minAllowed;

  const applyAmount = (value, { markMin = false } = {}) => {
    if (!Number.isFinite(value)) return;
    const safe = value < minAllowed ? minAllowed : value;
    setRaw(String(safe));
    setIsMinSelected(markMin);
  };

  const handleSetMin = () => {
    applyAmount(minAllowed, { markMin: true });
  };

  const handleAdd = (delta) => {
    const base = numeric > 0 ? numeric : minAllowed;
    applyAmount(base + delta, { markMin: false });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canBid) return;
    onBid?.(numeric);
    setRaw("");
    setIsMinSelected(false);
  };

  return (
    <div className={styles.card}>
      {/* 상단 남은 시간 배지 */}
      {countdownText && (
        <div className={styles.timerBadge}>{countdownText}</div>
      )}

      {/* 메타 정보 */}
      <div className={styles.meta}>
        <div className={styles.metaBlock}>
          <div className={styles.metaLabel}>현재 참여자 수</div>
          <div className={styles.metaValue}>
            {participantsCount !== null
              ? `${participantsCount.toLocaleString("ko-KR")}명`
              : "-"}
          </div>
        </div>

        <div className={styles.metaBlock}>
          <div className={styles.metaLabel}>시작가</div>
          <div className={styles.metaValue}>{fmtKRW(startPrice)}</div>
        </div>

        <div className={styles.metaBlock}>
          <div className={styles.metaLabel}>현재가</div>
          <div className={styles.metaValue}>{fmtKRW(effectiveCurrent)}</div>
        </div>

        <div className={styles.metaBlock}>
          <div className={styles.metaLabel}>다음 최소 입찰가</div>
          <div className={styles.metaValue}>{fmtKRW(minAllowed)}</div>
        </div>
      </div>

      {/* 입찰 입력 */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.inputLabel}>
          입찰 금액 <span className={styles.required}>*</span>
        </label>
        <div className={styles.inputWrap}>
          <span className={styles.prefix}>₩</span>
          <input
            type="text"
            inputMode="numeric"
            className={styles.input}
            placeholder="입찰 금액을 입력하세요"
            value={raw ? Number(raw).toLocaleString("ko-KR") : ""}
            onChange={onChangePrice}
            aria-label="희망 입찰가"
          />
          <span className={styles.suffix}>원</span>
        </div>

        {/* 빠른 입찰 버튼 */}
        <div className={styles.quickRow}>
          <button
            type="button"
            className={`${styles.quickBtn} ${
              isMinSelected ? styles.quickBtnPrimary : ""
            }`}
            onClick={handleSetMin}
          >
            최소가
          </button>
          <button
            type="button"
            className={styles.quickBtn}
            onClick={() => handleAdd(1000)}
          >
            +1,000
          </button>
          <button
            type="button"
            className={styles.quickBtn}
            onClick={() => handleAdd(5000)}
          >
            +5,000
          </button>
          <button
            type="button"
            className={styles.quickBtn}
            onClick={() => handleAdd(10000)}
          >
            +10,000
          </button>
        </div>

        {raw !== "" && numeric < minAllowed && (
          <div className={styles.helper}>
            {`${fmtKRW(minAllowed)} 이상부터 입찰 가능해요. (현재가 ${fmtKRW(
              effectiveCurrent
            )}, 최소호가 ${fmtKRW(step)})`}
          </div>
        )}

        <button
          className={styles.btn}
          type="submit"
          disabled={!canBid}
        >
          입찰하기
        </button>
      </form>
    </div>
  );
}

