// src/pages/AuctionRegistration/CategoryChips.js
// - Single select (라디오처럼 1개만 선택)
// - 버튼은 내용 길이만큼(width: fit-content) 배치 (CSS에서 처리)
// - '기타' 선택 시 입력창 노출, 입력 없을 때는 ['etc']로 부모에 전달 → 깜빡임 방지
// - API로는 string[] 반환 ([], ['digital'] 또는 ['사용자텍스트'])

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import styles from "../../styles/AuctionRegistration/CategoryChips.module.css";

const CATEGORIES = [
  { key: "women-acc",      label: "여성잡화",      icon: "solar:bag-smile-outline" },
  { key: "food-processed", label: "가공식품",      icon: "solar:chef-hat-linear" },
  { key: "sports",         label: "스포츠/레저",   icon: "solar:balls-linear" },
  { key: "plant",          label: "식물",          icon: "solar:waterdrop-linear" },
  { key: "game-hobby",     label: "게임/취미/음반", icon: "solar:reel-2-broken" },
  { key: "ticket",         label: "티켓",          icon: "solar:ticket-sale-linear" },
  { key: "furniture",      label: "가구/인테리어", icon: "solar:armchair-2-linear" },
  { key: "beauty",         label: "뷰티/미용",     icon: "solar:magic-stick-3-linear" },
  { key: "clothes",        label: "의류",          icon: "solar:hanger-broken" },
  { key: "health-food",    label: "건강기능식품",   icon: "solar:dumbbell-large-minimalistic-linear" },
  { key: "book",           label: "도서",          icon: "solar:notebook-broken" },
  { key: "kids",           label: "유아동",        icon: "solar:smile-circle-linear" },
  { key: "digital",        label: "디지털 기기",    icon: "solar:laptop-minimalistic-linear" },
  { key: "living-kitchen", label: "생활/주방",      icon: "solar:whisk-linear" },
  { key: "home-appliance", label: "생활가전",      icon: "solar:washing-machine-minimalistic-linear" },
  { key: "etc",            label: "기타",          icon: "solar:add-square-broken" },
];

// 출력 순서(스크린샷 배치 기준)
const ORDER_KEYS = [
  "women-acc","food-processed","sports","plant","game-hobby",
  "ticket","furniture","beauty","clothes","health-food",
  "book","kids","digital","living-kitchen","home-appliance","etc"
];

export default function CategoryChips({
  value = [],               // [] 또는 [key/customText]
  onChange,
  title = "카테고리 선택",
  helper = "원하는 카테고리가 없는 경우 ‘기타’로 직접 입력하세요.",
}) {
  // props → 내부 상태 동기화
  const initial = value[0] || "";
  const isKnownKey = CATEGORIES.some(c => c.key === initial);
  const isEtcToken = initial === "etc";

  const [selectedKey, setSelectedKey] = useState(
    isKnownKey ? initial : (initial ? "etc" : "")
  );
  const [customText, setCustomText] = useState(
    isKnownKey || isEtcToken ? "" : (initial || "")
  );

  useEffect(() => {
    const v = value[0] || "";
    const matchKey = CATEGORIES.some(c => c.key === v);
    if (matchKey) {
      setSelectedKey(v);
      setCustomText("");
      return;
    }
    if (v === "etc") {
      setSelectedKey("etc");
      // 입력 전 상태이므로 customText는 공백 유지
      setCustomText("");
      return;
    }
    // 사용자 정의 텍스트
    if (v) {
      setSelectedKey("etc");
      setCustomText(v);
    } else {
      setSelectedKey("");
      setCustomText("");
    }
  }, [value]);

  // 칩 정렬
  const chips = useMemo(() => {
    const map = new Map(CATEGORIES.map(c => [c.key, c]));
    return ORDER_KEYS.map(k => map.get(k)).filter(Boolean);
  }, []);

  // 부모로 값 전달 (깜빡임 방지 핵심: etc 선택 시 입력이 비어도 ['etc'] 유지)
  const emit = (key, custom = customText) => {
    if (!key) return onChange?.([]);
    if (key === "etc") {
      const t = (custom || "").trim();
      return onChange?.(t ? [t] : ["etc"]);
    }
    onChange?.([key]);
  };

  const handleSelect = (key) => {
    if (key === selectedKey && key !== "etc") {
      setSelectedKey("");
      emit("");
      return;
    }
    setSelectedKey(key);
    if (key !== "etc") {
      setCustomText("");
      emit(key);
    } else {
      // 기타 선택 → 입력 없으면 ['etc']로 유지
      emit("etc", customText);
    }
  };

  const handleKey = (e, key) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelect(key);
    }
  };

  const onCustomChange = (e) => {
    const txt = e.target.value;
    setCustomText(txt);
    if (selectedKey === "etc") emit("etc", txt); // 입력에 따라 ['etc'] ↔ ['텍스트']
  };

  const isActive = (key) => (key === "etc" ? selectedKey === "etc" : selectedKey === key);

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.title}>{title}</div>
        <div className={styles.helper}>{helper}</div>
      </div>

      <div className={styles.row} role="radiogroup" aria-label="카테고리 선택 (단일)">
        {chips.map(({ key, label, icon }) => {
          const active = isActive(key);
          return (
            <button
              key={key}
              type="button"
              className={`${styles.chip} ${active ? styles.isActive : ""}`}
              onClick={() => handleSelect(key)}
              onKeyDown={(e) => handleKey(e, key)}
              role="radio"
              aria-checked={active}
              data-key={key}
            >
              <span className={styles.icon}><Icon icon={icon} /></span>
              <span className={styles.label}>{label}</span>
            </button>
          );
        })}
      </div>

      {selectedKey === "etc" && (
        <div className={styles.customRow}>
          <label className={styles.customLabel} htmlFor="customCategory">
            기타 카테고리 직접 입력
          </label>
          <input
            id="customCategory"
            className={styles.customInput}
            type="text"
            placeholder="예) 중고공구 / 수집품 / 빈티지 소품"
            value={customText}
            onChange={onCustomChange}
            maxLength={30}
          />
          <p className={styles.customHint}>
            입력하면 해당 텍스트가 카테고리로 저장됩니다.
          </p>
        </div>
      )}
    </div>
  );
}
