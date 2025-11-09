import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import styles from "../../styles/AuctionList/FilterSidebar.module.css";
import mapPng from "../../assets/img/AuctionList/map.png";

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
  { key: "VERY_NEAR", km: 2,      short: "2km",   caption: "동네",  icon: "solar:home-2-linear" },
  { key: "NEAR",      km: 5,      short: "5km",   caption: "근처",  icon: "solar:buildings-2-linear" },
  { key: "MEDIUM",    km: 20,     short: "20km",  caption: "중간",  icon: "solar:map-point-wave-linear" },
  { key: "FAR",       km: 50,     short: "50km",  caption: "멀리",  icon: "solar:plain-linear" },
  { key: "ALL",       km: 20000,  short: "전체",  caption: "전국",  icon: "solar:planet-linear" },
];

export default function FilterSidebar({
  categories = [],
  activeCategories = [],
  price = { min: 0, max: 0 },
  sort = "",
  query = "",
  range = "NEAR",
  onChangeCategories,
  onChangePrice,
  onChangeSort,
  onChangeQuery,
  onChangeRange,
  onClear,
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
    onChangeRange?.("NEAR");
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
      <div className={styles.mapCard}>
        <img className={styles.mapImg} src={mapPng} alt="map" />
        <div className={styles.locPill}>경기도 고양시 덕양구</div>
      </div>

      <section className={styles.panel}>
        <header className={styles.panelHead}>
          <h4 className={styles.panelTitle}>Filter by:</h4>
          <button type="button" className={styles.clearBtn} onClick={handleClear}>
            Clear
          </button>
        </header>

        {/* 활동 반경 */}
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

                {/* 중앙: 길어진 슬라이더 */}
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
