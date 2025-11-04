// src/pages/AuctionRegistration/CategoryChips.js
// - Single select (라디오처럼 1개만 선택)
// - 버튼은 내용 길이만큼(width: fit-content) 배치 (CSS에서 처리)
// - '기타'는 별도 입력 없이 그냥 'etc' 값으로 선택되도록 단순화
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import styles from "../../styles/AuctionRegistration/CategoryChips.module.css";

const CATEGORIES = [
  { key: "women-acc",      label: "여성잡화",       icon: "solar:bag-smile-outline" },
  { key: "food-processed", label: "가공식품",       icon: "solar:chef-hat-linear" },
  { key: "sports",         label: "스포츠/레저",    icon: "solar:balls-linear" },
  { key: "plant",          label: "식물",           icon: "solar:waterdrop-linear" },
  { key: "game-hobby",     label: "게임/취미/음반",  icon: "solar:reel-2-broken" },
  { key: "ticket",         label: "티켓",           icon: "solar:ticket-sale-linear" },
  { key: "furniture",      label: "가구/인테리어",  icon: "solar:armchair-2-linear" },
  { key: "beauty",         label: "뷰티/미용",      icon: "solar:magic-stick-3-linear" },
  { key: "clothes",        label: "의류",           icon: "solar:hanger-broken" },
  { key: "health-food",    label: "건강기능식품",    icon: "solar:dumbbell-large-minimalistic-linear" },
  { key: "pet",            label: "반려동물",       icon: "solar:cat-linear" },              /* ✅ 추가 */
  { key: "book",           label: "도서",           icon: "solar:notebook-broken" },
  { key: "kids",           label: "유아동",         icon: "solar:smile-circle-linear" },
  { key: "digital",        label: "디지털 기기",     icon: "solar:laptop-minimalistic-linear" },
  { key: "living-kitchen", label: "생활/주방",       icon: "solar:whisk-linear" },
  { key: "home-appliance", label: "생활가전",       icon: "solar:washing-machine-minimalistic-linear" },
  { key: "etc",            label: "기타",           icon: "solar:add-square-broken" },
];

// 출력 순서(스크린샷 배치 기준)
const ORDER_KEYS = [
  "women-acc","food-processed","sports","plant","game-hobby",
  "ticket","furniture","beauty","clothes","health-food",
  "pet", /* ✅ 추가 순서 반영 */
  "book","kids","digital","living-kitchen","home-appliance","etc"
];

export default function CategoryChips({
  value = [],               // [] 또는 [key]
  onChange,
  title = "카테고리 선택",
  helper = "원하는 카테고리가 없으면 ‘기타’를 선택하세요.",
}) {
  // 초기값 동기화
  const initial = value[0] || "";
  const isKnownKey = CATEGORIES.some(c => c.key === initial);

  const [selectedKey, setSelectedKey] = useState(isKnownKey ? initial : "");

  useEffect(() => {
    const v = value[0] || "";
    setSelectedKey(CATEGORIES.some(c => c.key === v) ? v : "");
  }, [value]);

  // 칩 정렬
  const chips = useMemo(() => {
    const map = new Map(CATEGORIES.map(c => [c.key, c]));
    return ORDER_KEYS.map(k => map.get(k)).filter(Boolean);
  }, []);

  // 부모로 값 전달
  const emit = (key) => {
    if (!key) return onChange?.([]);
    onChange?.([key]);
  };

  // 선택/해제
  const handleSelect = (key) => {
    if (key === selectedKey) {
      // 동일 항목 재클릭 시 해제 (필수 선택이라면 이 로직 제거)
      setSelectedKey("");
      emit("");
      return;
    }
    setSelectedKey(key);
    emit(key); // 'etc'도 그대로 ['etc'] 전송
  };

  const handleKey = (e, key) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelect(key);
    }
  };

  const isActive = (key) => selectedKey === key;

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
    </div>
  );
}
