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

/** 카테고리 표시 순서 (등록 화면과 동일) — pet 빠진 문제 수정 */
const ORDER_KEYS = [
  "women-acc","food-processed","sports","plant","game-hobby",
  "ticket","furniture","beauty","clothes","health-food",
  "book","kids","digital","living-kitchen","home-appliance",
  "pet", /* ✅ 추가 */
  "etc"
];

const onlyDigits = (s) => (s || "").replace(/[^\d]/g, "");
const fmt = (s) => (s ? Number(s).toLocaleString("ko-KR") : "");

export default function FilterSidebar({
  categories = [],
  activeCategory,
  price = { min: 0, max: 0 },
  sort = "",
  query = "",
  onChangeCategory,
  onChangePrice,
  onChangeSort,
  onChangeQuery,
  onClear,
}) {
  // 표시용 문자열
  const [minStr, setMinStr] = useState("");
  const [maxStr, setMaxStr] = useState("");
  const [sortKey, setSortKey] = useState("");
  const [qStr, setQStr] = useState("");

  // 섹션 토글 상태
  const [openSearch, setOpenSearch] = useState(true);
  const [openPrice, setOpenPrice] = useState(true);
  const [openSort, setOpenSort] = useState(true);
  const [openCats, setOpenCats] = useState(true);

  // 부모 state ↔ 표시 문자열 동기화
  useEffect(() => {
    const toStr = (v) => (v && Number(v) > 0 ? Number(v).toLocaleString("ko-KR") : "");
    setMinStr(toStr(price.min));
    setMaxStr(toStr(price.max));
  }, [price.min, price.max]);

  useEffect(() => { setSortKey(sort || ""); }, [sort]);
  useEffect(() => { setQStr(query || ""); }, [query]);

  // 카테고리 칩 정렬
  const catChips = useMemo(() => {
    const list = categories.filter((c) => c.key !== "all");
    const map = new Map(list.map((c) => [c.key, c]));
    // ORDER_KEYS 순으로 먼저
    const ordered = ORDER_KEYS.map((k) => map.get(k)).filter(Boolean);
    // ✅ ORDER_KEYS에 없는 키(향후 추가 대비)는 끝에 덧붙임
    list.forEach((c) => { if (!ORDER_KEYS.includes(c.key)) ordered.push(c); });
    return ordered;
  }, [categories]);

  // 가격 변경
  const handleMinChange = (e) => setMinStr(fmt(onlyDigits(e.target.value)));
  const handleMaxChange = (e) => setMaxStr(fmt(onlyDigits(e.target.value)));
  const emitPrice = () => {
    let min = Number(onlyDigits(minStr)) || 0;
    let max = Number(onlyDigits(maxStr)) || 0;
    if (min > 0 && max > 0 && min > max) [min, max] = [max, min];
    onChangePrice?.({ min, max });
  };
  const handlePriceKey = (e) => {
    if (e.key === "Enter") { e.currentTarget.blur(); emitPrice(); }
  };

  // 정렬: 단일 선택(토글)
  const handleSort = (key) => {
    setSortKey((prev) => {
      const next = prev === key ? "" : key;
      onChangeSort?.(next);
      return next;
    });
  };

  // 검색 입력
  const handleQueryChange = (e) => {
    const v = e.target.value;
    setQStr(v);
    onChangeQuery?.(v);
  };

  // 카테고리
  const handleCategory = (key) => onChangeCategory?.(key);

  // 전체 초기화
  const handleClear = () => {
    setMinStr("");
    setMaxStr("");
    setSortKey("");
    setQStr("");
    onChangeQuery?.("");
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

        {/* 검색 */}
        <div className={styles.group}>
          <button
            type="button"
            className={styles.groupHead}
            aria-expanded={openSearch}
            onClick={() => setOpenSearch((v) => !v)}
          >
            <span>검색</span>
            <Icon
              icon="solar:alt-arrow-down-linear"
              className={`${styles.chev} ${openSearch ? styles.chevOpen : ""}`}
            />
          </button>

          {openSearch && (
            <div className={styles.searchWrap}>
              <Icon icon="solar:magnifer-linear" className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                placeholder="제목 검색"
                value={qStr}
                onChange={handleQueryChange}
                onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
                aria-label="제목 검색"
              />
              {qStr && (
                <button
                  type="button"
                  className={styles.searchClear}
                  onClick={() => { setQStr(""); onChangeQuery?.(""); }}
                  aria-label="검색어 지우기"
                >
                  <Icon icon="solar:close-circle-linear" />
                </button>
              )}
            </div>
          )}
        </div>

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
