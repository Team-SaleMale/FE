import React, { useEffect, useMemo, useRef } from "react";
import { Icon } from "@iconify/react";
import styles from "../../styles/AuctionRegistration/TradeMethod.module.css";

/**
 * 거래 방법 선택 (다중 선택)
 * - 택배 / 직거래 / 기타
 * - '기타'가 포함되어 있을 때만 아래 입력창 활성화
 *
 * 호환성:
 *  - 기존 단일 선택 prop(method: string)과 동작
 *  - 새 다중 선택 prop(methods: string[])
 *  - onChange 시 둘 다 내려줌: ("tradeMethod", string[]), ("tradeMethods", string[])
 *
 * props:
 *  - method?: string                 // 과거 단일 선택 값
 *  - methods?: string[]              // 새로운 다중 선택 값
 *  - note: string
 *  - onChange: (key, value) => void
 */
export default function TradeMethod({
  method = "",
  methods = undefined,
  note = "",
  onChange,
}) {
  // 단일/다중 입력을 통합해 "선택 목록"으로 정규화
  const selectedList = useMemo(() => {
    if (Array.isArray(methods)) return methods;
    return method ? [method] : [];
  }, [method, methods]);

  const etcActive = selectedList.includes("기타");
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

  // 토글(선택 해제/선택)
  const handleToggle = (val) => {
    let next;
    if (selectedList.includes(val)) {
      next = selectedList.filter((k) => k !== val);
    } else {
      next = [...selectedList, val];
    }

    // 부모가 어떤 키를 쓰든 대응
    onChange?.("tradeMethod", next);   // 기존 키도 배열로 전달
    onChange?.("tradeMethods", next);  // 새 키(권장)

    // '기타'가 빠졌다면 note 초기화
    if (!next.includes("기타") && note) onChange?.("tradeNote", "");
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h3 className={styles.title}>거래 방법 선택</h3>
        <p className={styles.helper}>원하는 거래 방식이 없는 경우 텍스트를 작성해주세요!!</p>
      </div>

      {/* 칩 다중 선택 (토글 버튼) */}
      <div className={styles.row} role="group" aria-label="거래 방법">
        {options.map((opt) => {
          const selected = selectedList.includes(opt.key);
          return (
            <button
              key={opt.key}
              type="button"
              className={`${styles.chip} ${selected ? styles.isActive : ""}`}
              onClick={() => handleToggle(opt.key)}
              aria-pressed={selected}           // 토글 접근성
            >
              <Icon icon={opt.icon} className={styles.icon} />
              <span className={styles.label}>{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* 원하는 거래 방식 작성 (하단, 기타 포함 시 활성화) */}
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
        <p className={styles.customHint}>‘기타’를 선택하면 입력할 수 있어요.</p>
      </div>
    </div>
  );
}
