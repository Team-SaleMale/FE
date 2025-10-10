// src/pages/AuctionList/FilterSidebar.js
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import styles from "../../styles/AuctionList/FilterSidebar.module.css";
import mapPng from "../../assets/img/AuctionList/map.png";

/** 정렬 옵션(마감 임박순 제거) */
const SORTS = [
  { key: "bids",      label: "입찰 많은 순" },
  { key: "priceLow",  label: "가격 낮은 순" },
  { key: "priceHigh", label: "가격 높은 순" },
  { key: "views",     label: "조회수 많은 순" },
];

/** 카테고리 표시 순서 (등록 화면과 동일) */
const ORDER_KEYS = [
  "women-acc","food-processed","sports","plant","game-hobby",
  "ticket","furniture","beauty","clothes","health-food",
  "book","kids","digital","living-kitchen","home-appliance","etc"
];

const onlyDigits = (s) => (s || "").replace(/[^\d]/g, "");
const fmt = (s) => (s ? Number(s).toLocaleString("ko-KR") : "");

export default function FilterSidebar({
  categories = [],
  activeCategory,
  price = { min: 0, max: 0 },   // ✅ 부모 값과 동기화
  sort = "",
  onChangeCategory,
  onChangePrice,                // ({min, max})
  onChangeSort,                 // (sortKey)
  onClear,
}) {
  // 표시용 문자열(콤마 포함)
  const [minStr, setMinStr] = useState("");
  const [maxStr, setMaxStr] = useState("");
  const [sortKey, setSortKey] = useState("");

  const [openPrice, setOpenPrice] = useState(true);
  const [openSort, setOpenSort] = useState(true);
  const [openCats, setOpenCats] = useState(true);

  // 부모 price → 표시문자열 동기화
  useEffect(() => {
    const toStr = (v) => (v && Number(v) > 0 ? Number(v).toLocaleString("ko-KR") : "");
    setMinStr(toStr(price.min));
    setMaxStr(toStr(price.max));
  }, [price.min, price.max]);

  // 부모 sort → 체크박스 동기화
  useEffect(() => {
    setSortKey(sort || "");
  }, [sort]);

  // 카테고리 칩 정렬
  const catChips = useMemo(() => {
    const list = categories.filter((c) => c.key !== "all");
    const map = new Map(list.map((c) => [c.key, c]));
    return ORDER_KEYS.map((k) => map.get(k)).filter(Boolean);
  }, [categories]);

  // 입력 즉시 3자리 콤마 적용
  const handleMinChange = (e) => setMinStr(fmt(onlyDigits(e.target.value)));
  const handleMaxChange = (e) => setMaxStr(fmt(onlyDigits(e.target.value)));

  // 가격 emit: min > max면 자동 스왑
  const emitPrice = () => {
    let min = Number(onlyDigits(minStr)) || 0;
    let max = Number(onlyDigits(maxStr)) || 0;
    if (min > 0 && max > 0 && min > max) [min, max] = [max, min];
    onChangePrice?.({ min, max });
  };

  const handlePriceKey = (e) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
      emitPrice();
    }
  };

  // 정렬: 단일선택 + 같은 키 재클릭시 해제
  const handleSort = (key) => {
    setSortKey((prev) => {
      const next = prev === key ? "" : key;
      onChangeSort?.(next);
      return next;
    });
  };

  const handleCategory = (key) => onChangeCategory?.(key);

  // Clear
  const handleClear = () => {
    setMinStr("");
    setMaxStr("");
    setSortKey("");
    onChangePrice?.({ min: 0, max: 0 });
    onChangeSort?.("");
    onChangeCategory?.("all");
    onClear?.();
  };

  return (
    <div className={styles.wrap}>
      {/* 지도 */}
      <div className={styles.mapCard}>
        <img className={styles.mapImg} src={mapPng} alt="map" />
        <div className={styles.locPill}>경기도 고양시 덕양구</div>
      </div>

      {/* 패널 */}
      <section className={styles.panel}>
        <header className={styles.panelHead}>
          <h4 className={styles.panelTitle}>Filter by:</h4>
          <button type="button" className={styles.clearBtn} onClick={handleClear}>
            Clear
          </button>
        </header>

        {/* 가격 범위 */}
        <div className={styles.group}>
          <button
            type="button"
            className={styles.groupHead}
            aria-expanded={openPrice}
            onClick={() => setOpenPrice((v) => !v)}
          >
            <span>가격 범위</span>
            <Icon
              icon="solar:alt-arrow-down-linear"
              className={`${styles.chev} ${openPrice ? styles.chevOpen : ""}`}
            />
          </button>

          {openPrice && (
            <div className={styles.priceGrid}>
              <label className={styles.subLabel} htmlFor="min">Minimum</label>
              <label className={styles.subLabel} htmlFor="max">Maximum</label>

              <div className={styles.inputPillWrap}>
                <span className={styles.won}>₩</span>
                <input
                  id="min"
                  inputMode="numeric"
                  className={styles.inputPill}
                  value={minStr}
                  onChange={handleMinChange}
                  onBlur={emitPrice}
                  onKeyDown={handlePriceKey}
                  placeholder="0"
                  aria-label="최소 가격"
                />
              </div>

              <div className={styles.inputPillWrap}>
                <span className={styles.won}>₩</span>
                <input
                  id="max"
                  inputMode="numeric"
                  className={styles.inputPill}
                  value={maxStr}
                  onChange={handleMaxChange}
                  onBlur={emitPrice}
                  onKeyDown={handlePriceKey}
                  placeholder="0"
                  aria-label="최대 가격"
                />
              </div>
            </div>
          )}
        </div>

        {/* 정렬 옵션 */}
        <div className={styles.group}>
          <button
            type="button"
            className={styles.groupHead}
            aria-expanded={openSort}
            onClick={() => setOpenSort((v) => !v)}
          >
            <span>정렬 옵션</span>
            <Icon
              icon="solar:alt-arrow-down-linear"
              className={`${styles.chev} ${openSort ? styles.chevOpen : ""}`}
            />
          </button>

          {openSort && (
            <div className={styles.checkCol}>
              {SORTS.map(({ key, label }) => (
                <label key={key} className={styles.checkRow}>
                  <input
                    type="checkbox"
                    checked={sortKey === key}
                    onChange={() => handleSort(key)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* 카테고리 */}
        <div className={styles.group}>
          <button
            type="button"
            className={styles.groupHead}
            aria-expanded={openCats}
            onClick={() => setOpenCats((v) => !v)}
          >
            <span>카테고리</span>
            <Icon
              icon="solar:alt-arrow-down-linear"
              className={`${styles.chev} ${openCats ? styles.chevOpen : ""}`}
            />
          </button>

          {openCats && (
            <div className={styles.chipWrap} role="radiogroup" aria-label="카테고리">
              {catChips.map(({ key, label, icon }) => {
                const active = activeCategory === key;
                return (
                  <button
                    key={key}
                    type="button"
                    className={`${styles.chip} ${active ? styles.isActive : ""}`}
                    onClick={() => handleCategory(key)}
                    role="radio"
                    aria-checked={active}
                    title={label}
                  >
                    <span className={styles.chipIcon}><Icon icon={icon} /></span>
                    <span className={styles.chipLabel}>{label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
