import React, { useEffect, useMemo, useRef } from "react";
import { Icon } from "@iconify/react";
import styles from "../../styles/AuctionRegistration/TradeMethod.module.css";

/**
 * 거래 방법 선택 (단일 선택)
 * - 택배 | 직거래 | 기타
 * - '기타' 선택 시 아래 입력창 활성화
 *
 * props
 *  - method: "택배" | "직거래" | "기타" | ""
 *  - note: string
 *  - onChange: (key, value) => void
 */
export default function TradeMethod({ method = "", note = "", onChange }) {
  const etcActive = method === "기타";
  const inputRef = useRef(null);

  useEffect(() => {
    if (etcActive && inputRef.current) inputRef.current.focus();
  }, [etcActive]);

  const options = useMemo(
    () => [
      { key: "택배", label: "택배", icon: "solar:box-linear" },
      { key: "직거래", label: "직거래", icon: "solar:map-point-favourite-linear" },
      { key: "기타", label: "기타", icon: "solar:minimalistic-magnifer-zoom-in-linear" },
    ],
    []
  );

  const handlePick = (val) => {
    if (val === method) return;
    onChange?.("tradeMethod", val);
    if (val !== "기타") onChange?.("tradeNote", "");
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h3 className={styles.title}>거래 방법 선택</h3>
        <p className={styles.helper}>원하는 거래 방식이 없는 경우 텍스트를 작성해주세요!!</p>
      </div>

      {/* 칩 단일 선택 */}
      <div className={styles.row} role="radiogroup" aria-label="거래 방법">
        {options.map((opt) => {
          const selected = method === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              className={`${styles.chip} ${selected ? styles.isActive : ""}`}
              onClick={() => handlePick(opt.key)}
              role="radio"
              aria-checked={selected}
            >
              <Icon icon={opt.icon} className={styles.icon} />
              <span className={styles.label}>{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* 원하는 거래 방식 작성 (라벨 + pill input) */}
      <div className={styles.customRow} aria-live="polite">
        <span className={styles.customLabel}>원하는 거래 방식 작성</span>
        <div className={styles.inputWrap}>
          <input
            id="tradeNote"
            ref={inputRef}
            type="text"
            className={styles.customInput}
            placeholder="EX) 서울 강남구 00빌라 → 문고리 거래"
            disabled={!etcActive}
            value={note}
            onChange={(e) => onChange?.("tradeNote", e.target.value)}
            aria-disabled={!etcActive}
            aria-label="원하는 거래 방식 텍스트 입력"
          />
        </div>
        <p className={styles.customHint}>
          ‘기타’를 선택하면 입력할 수 있어요.
        </p>
      </div>
    </div>
  );
}
