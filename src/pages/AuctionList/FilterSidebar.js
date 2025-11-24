// src/pages/AuctionList/FilterSidebar.js
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import styles from "../../styles/AuctionList/FilterSidebar.module.css";

/** 정렬 옵션 */
const SORTS = [
  { key: "",          label: "최신순" },
  { key: "bids",      label: "입찰 많은 순" },
  { key: "priceLow",  label: "가격 낮은 순" },
  { key: "priceHigh", label: "가격 높은 순" },
  { key: "views",     label: "조회수 많은 순" },
];

/** 카테고리 표시 순서 */
const ORDER_KEYS = [
  "women-acc","food-processed","sports","plant","game-hobby",
  "ticket","furniture","beauty","clothes","health-food",
  "book","kids","digital","living-kitchen","home-appliance",
  "pet","etc"
];

const onlyDigits = (s) => (s || "").replace(/[^\d]/g, "");
const fmt = (s) => (s ? Number(s).toLocaleString("ko-KR") : "");

/** 활동 반경(5단계) — ALL의 short는 ‘전체’ */
const RANGES = [
  { key: "VERY_NEAR", km:  0.5,      short: " 0.5km",   caption: "동네",  icon: "solar:home-2-linear" },
  { key: "NEAR",      km: 1,      short: "1km",   caption: "근처",  icon: "solar:buildings-2-linear" },
  { key: "MEDIUM",    km: 3,     short: "3km",  caption: "중간",  icon: "solar:map-point-wave-linear" },
  { key: "FAR",       km: 5,     short: "5km",  caption: "멀리",  icon: "solar:plain-linear" },
  { key: "ALL",       km: 20000000000,  short: "전체",  caption: "전국",  icon: "solar:planet-linear" },
];

export default function FilterSidebar({
  categories = [],
  activeCategories = [],
  price = { min: 0, max: 0 },
  sort = "",
  query = "",
  range = "NEAR",
  showRange = true,
  onChangeCategories,
  onChangePrice,
  onChangeSort,
  onChangeQuery,
  onChangeRange,
  onClear,
  /* ✅ 추가: 상단 지역 라벨(부모에서 전달) */
  regionText = "로그인 후 확인가능합니다",
}) {
  const [minStr, setMinStr] = useState("");
  const [maxStr, setMaxStr] = useState("");
  const [sortKey, setSortKey] = useState("");
  const [qStr, setQStr] = useState("");

  const [openSearch, setOpenSearch] = useState(true);
  const [openPrice, setOpenPrice] = useState(true);
  const [openSort, setOpenSort] = useState(true);
  const [openCats, setOpenCats] = useState(true);
  const [openRange, setOpenRange] = useState(true);

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
    const ordered = ORDER_KEYS.map((k) => map.get(k)).filter(Boolean);
    list.forEach((c) => { if (!ORDER_KEYS.includes(c.key)) ordered.push(c); });
    return ordered;
  }, [categories]);

  // 가격
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

  // 정렬 (토글)
  const handleSort = (key) => {
    setSortKey((prev) => {
      const next = prev === key ? "" : key;
      onChangeSort?.(next);
      return next;
    });
  };

  // 검색
  const handleQueryChange = (e) => {
    const v = e.target.value;
    setQStr(v);
    onChangeQuery?.(v);
  };

  // 카테고리(다중)
  const toggleCategory = (key) => {
    onChangeCategories?.((prev) => {
      const set = new Set(prev || []);
      if (set.has(key)) set.delete(key); else set.add(key);
      return Array.from(set);
    });
  };

  const handleClear = () => {
    setMinStr(""); setMaxStr(""); setSortKey(""); setQStr("");
    onChangeQuery?.("");
    onChangePrice?.({ min: 0, max: 0 });
    onChangeSort?.("");
    onChangeCategories?.([]);
    onChangeRange?.(range || "NEAR");
    onClear?.();
  };

  // ---- 활동 반경 (슬라이더) ----
  const curIdx = Math.max(0, RANGES.findIndex((r) => r.key === range));
  const pct = (curIdx / (RANGES.length - 1)) * 100;
  const cur = RANGES[curIdx] ?? RANGES[1];
  const setByIndex = (i) => {
    const next = RANGES[Math.min(Math.max(i, 0), RANGES.length - 1)];
    if (next && next.key !== range) onChangeRange?.(next.key);
  };

  return (
    <div className={styles.wrap}>
      {/* 지도 이미지 대신 심플한 그래디언트 카드 */}
      <div className={styles.mapCard} role="region" aria-label="현재 위치 요약">
        <div className={styles.mapCardBg} aria-hidden="true">
          <span className={`${styles.bubble} ${styles.b1}`} />
          <span className={`${styles.bubble} ${styles.b2}`} />
          <span className={`${styles.bubble} ${styles.b3}`} />
        </div>
        <div className={styles.locRow}>
          <Icon icon="solar:map-point-wave-linear" className={styles.locIcon} />
          {/* ✅ 서버에서 받아온 지역/비로그인 문구 표시 */}
          <span className={styles.locText}>{regionText || "로그인 후 확인가능합니다"}</span>
          <button type="button" className={styles.locBtn} aria-label="현재 위치 갱신">
            <Icon icon="solar:gps-linear" />
          </button>
        </div>
      </div>

      <section className={styles.panel}>
        <header className={styles.panelHead}>
          <h4 className={styles.panelTitle}>Filter by:</h4>
          <button type="button" className={styles.clearBtn} onClick={handleClear}>
            Clear
          </button>
        </header>

        {/* 활동 반경 — 비로그인 시 숨김 */}
        {showRange && (
          <div className={styles.group}>
            <button
              type="button"
              className={styles.groupHead}
              aria-expanded={openRange}
              onClick={() => setOpenRange((v) => !v)}
            >
              <span>활동 반경</span>
              <Icon icon="solar:alt-arrow-down-linear" className={`${styles.chev} ${openRange ? styles.chevOpen : ""}`} />
            </button>

            {openRange && (
              <div className={styles.rateCard}>
                <div className={styles.rateRow}>
                  {/* 좌측: 아이콘 + 캡션 */}
                  <div className={styles.rateIconCol}>
                    <div className={styles.rateIconBadge} aria-hidden="true">
                      <Icon icon={cur.icon} className={styles.rateIcon} />
                    </div>
                    <div className={styles.rateCaption}>
                      <span className={styles.rateCaptionTop}>{cur.caption}</span>
                      <span className={styles.rateCaptionSub}>{cur.short}</span>
                    </div>
                  </div>

                  {/* 중앙: 슬라이더 */}
                  <div className={styles.rateSliderCol}>
                    <div className={styles.rateBar} role="group" aria-label="활동 반경 선택">
                      <div className={styles.rateTrack} />
                      <div className={styles.rateFill} style={{ width: `${pct}%` }} />
                      <div className={styles.rateKnob} style={{ left: `${pct}%` }} />
                      {RANGES.map((_, i) => (
                        <button
                          key={`hit-${i}`}
                          type="button"
                          className={styles.rateHit}
                          style={{ left: `${(i / (RANGES.length - 1)) * 100}%` }}
                          aria-label={`${RANGES[i].short}`}
                          onClick={() => setByIndex(i)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 검색 */}
        <div className={styles.group}>
          <button
            type="button"
            className={styles.groupHead}
            aria-expanded={openSearch}
            onClick={() => setOpenSearch((v) => !v)}
          >
            <span>검색</span>
            <Icon icon="solar:alt-arrow-down-linear" className={`${styles.chev} ${openSearch ? styles.chevOpen : ""}`} />
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
            <Icon icon="solar:alt-arrow-down-linear" className={`${styles.chev} ${openPrice ? styles.chevOpen : ""}`} />
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

        {/* 정렬 */}
        <div className={styles.group}>
          <button
            type="button"
            className={styles.groupHead}
            aria-expanded={openSort}
            onClick={() => setOpenSort((v) => !v)}
          >
            <span>정렬 옵션</span>
            <Icon icon="solar:alt-arrow-down-linear" className={`${styles.chev} ${openSort ? styles.chevOpen : ""}`} />
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

        {/* 카테고리 (다중) */}
        <div className={styles.group}>
          <button
            type="button"
            className={styles.groupHead}
            aria-expanded={openCats}
            onClick={() => setOpenCats((v) => !v)}
          >
            <span>카테고리</span>
            <Icon icon="solar:alt-arrow-down-linear" className={`${styles.chev} ${openCats ? styles.chevOpen : ""}`} />
          </button>

          {openCats && (
            <div className={styles.chipWrap} role="group" aria-label="카테고리(다중)">
              {catChips.map(({ key, label, icon }) => {
                const active = (activeCategories || []).includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    className={`${styles.chip} ${active ? styles.isActive : ""}`}
                    onClick={() => toggleCategory(key)}
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

      {/* 패널 바깥쪽 하단 여백 */}
      <div className={styles.outsideSpacer} />
    </div>
  );
}
