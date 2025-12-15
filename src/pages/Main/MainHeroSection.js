/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import styles from "../../styles/Main/MainHeroSection.module.css";
import { fetchMyProfile } from "../../api/auctions/service";

/* ---------- 유틸 ---------- */
const onlyDigits = (s) => String(s || "").replace(/\D/g, "");
const withCommas = (raw) => {
  const d = onlyDigits(raw);
  return d ? d.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "";
};

/* UI key → 서버 enum (리스트 페이지와 동일 키) */
const CAT_TO_ENUM = {
  digital: "DIGITAL",
  clothes: "CLOTHES",
  beauty: "BEAUTY",
  "health-food": "HEALTH_FOOD",
  "home-appliance": "HOME_APPLIANCE",
  "living-kitchen": "LIVING_KITCHEN",
  "women-acc": "WOMEN_ACC",
  sports: "SPORTS",
  plant: "PLANT",
  "game-hobby": "GAME_HOBBY",
  ticket: "TICKET",
  furniture: "FURNITURE",
  book: "BOOK",
  kids: "KIDS",
  pet: "PET",
  "food-processed": "FOOD_PROCESSED",
  etc: "ETC",
};

/* 반경 옵션 */
const RADIUS_OPTIONS = [
  { value: "VERY_NEAR", label: "2km" },
  { value: "NEAR",      label: "5km"   },
  { value: "MEDIUM",    label: "20km"   },
  { value: "FAR",       label: "50km"   },
  { value: "ALL",       label: "전국"  },
];

/* 프로필에서 1차 지역 객체 추출(방어적) */
function extractPrimaryRegionObject(p) {
  const root = (p?.result ?? p?.data ?? p) || {};
  const bySingle =
    root.region ?? root.primaryRegion ?? root.homeRegion ?? root.currentRegion ?? null;
  if (bySingle) return bySingle;

  const list =
    root.regions ?? root.regionList ?? root.userRegions ?? root.myRegions ?? [];
  if (Array.isArray(list) && list.length) return list[0];
  return null;
}
function regionName(r) {
  const primary = r?.name ?? r?.label ?? r?.title;
  if (primary != null && primary !== "") return primary;

  const composed = [r?.sido, r?.sigungu, r?.dong].filter(Boolean).join(" ");
  if (composed) return composed;

  const addr = r?.address ?? r?.addr;
  return addr != null && addr !== "" ? addr : "지역";
}
function regionId(r) {
  if (!r) return null;
  return r.id ?? r.regionId ?? r.code ?? r.value ?? null;
}

const MainHeroSection = () => {
  const navigate = useNavigate();

  const categories = useMemo(
    () => [
      { key: "all",            label: "전체 경매",        icon: "solar:widget-2-linear" },
      { key: "digital",        label: "디지털 기기",      icon: "solar:laptop-minimalistic-linear" },
      { key: "home-appliance", label: "생활가전",         icon: "solar:washing-machine-minimalistic-linear" },
      { key: "clothes",        label: "의류",             icon: "solar:hanger-broken" },
      { key: "health-food",    label: "건강 기능 식품",   icon: "solar:dumbbell-large-minimalistic-linear" },
      { key: "ticket",         label: "티켓",             icon: "solar:ticket-sale-linear" },
    ],
    []
  );

  // 카테고리
  const [activeCat, setActiveCat] = useState("all");

  // 검색/가격
  const [keyword, setKeyword] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const handleMinChange = (e) => setMinPrice(withCommas(e.target.value));
  const handleMaxChange = (e) => setMaxPrice(withCommas(e.target.value));

  // 지역/반경
  const [loggedIn, setLoggedIn] = useState(false);
  const [regionLoading, setRegionLoading] = useState(false);
  const [primaryRegion, setPrimaryRegion] = useState(null);
  const [radius, setRadius] = useState("ALL"); // 기본값: 전국

  // 프로필에서 지역 불러오기(로그인 여부 판별 포함)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setRegionLoading(true);
        const res = await fetchMyProfile();
        const root = res?.result ?? res ?? {};
        const isLogin = !!(root?.id || root?.userId || root?.email || root?.username);
        if (!alive) return;
        setLoggedIn(isLogin);
        if (isLogin) {
          setPrimaryRegion(extractPrimaryRegionObject(res));
        }
      } catch (_) {
        if (!alive) return;
        setLoggedIn(false);
        setPrimaryRegion(null);
      } finally {
        if (alive) setRegionLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const onSearch = () => {
    // 가격 정규화
    let min = Number(onlyDigits(minPrice)) || 0;
    let max = Number(onlyDigits(maxPrice)) || 0;
    if (min > 0 && max > 0 && min > max) [min, max] = [max, min];

    const qs = new URLSearchParams();
    qs.set("tab", "ongoing"); // 진행 중 기본

    // 카테고리
    if (activeCat && activeCat !== "all") {
      const catEnum = CAT_TO_ENUM[activeCat];
      qs.set("cat", activeCat);                // UI 복원용
      if (catEnum) qs.set("categories", catEnum); // API용
    }

    // 검색어
    const qTrim = keyword.trim();
    if (qTrim) {
      qs.set("q", qTrim);
      qs.set("query", qTrim);
    }

    // 가격
    if (min > 0) {
      qs.set("min", String(min));
      qs.set("minPrice", String(min));
    }
    if (max > 0) {
      qs.set("max", String(max));
      qs.set("maxPrice", String(max));
    }

    // 반경/지역: 로그인 사용자인 경우만 적용
    if (loggedIn) {
      if (radius) qs.set("radius", radius); // service.js에서 radius/range 모두 처리
      const rid = regionId(primaryRegion);
      if (rid != null) qs.set("regionId", String(rid)); // 선택 UI는 없지만 값이 있으면 전달
    }

    navigate(`/auctions?${qs.toString()}`);
  };

  return (
    <section className={styles.mainherosection}>
      <div className={styles.background} />

      <div className={styles.titleBlock}>
        <h1 className={styles.title}>Discover Auction</h1>
        <p className={styles.subtitle}>
          희귀 아이템, 인기 상품, 특별한 중고 거래를
          <br />실시간 경매로 만나보세요
        </p>
      </div>

      <div className={styles.categoryBar}>
        {categories.map((c) => {
          const active = activeCat === c.key;
          return (
            <button
              key={c.key}
              type="button"
              className={`${styles.tab} ${active ? styles.tabActive : styles.tabInactive}`}
              onClick={() => setActiveCat(c.key)}
            >
              <Icon icon={c.icon} className={styles.tabIcon} />
              <span className={styles.tabLabel}>{c.label}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.searchWrap}>
        <div className={styles.searchCard}>

          {/* 현재 거주 지역 + 반경 */}
          <div className={styles.field}>
            <div className={styles.label}>현재 거주 지역</div>

            {loggedIn ? (
              <div className={styles.selectsRow}>
                {/* 지역은 단순 표시(드롭다운 제거) */}
                <div className={styles.selectWrap}>
                  <div className={styles.addressText} title={regionName(primaryRegion) || "설정된 지역 없음"}>
                    {regionLoading
                      ? "불러오는 중…"
                      : (regionName(primaryRegion) || "설정된 지역 없음")}
                  </div>
                </div>

                {/* 반경 선택 */}
                <div className={`${styles.selectWrap} ${styles.selectWrapArrow}`}>
                  <select
                    className={styles.select}
                    value={radius}
                    onChange={(e) => setRadius(e.target.value)}
                    aria-label="표시 반경 선택"
                  >
                    {RADIUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className={styles.addressText} aria-live="polite">
                로그인 후 확인가능합니다
              </div>
            )}
          </div>

          {/* 상품명 */}
          <div className={`${styles.field} ${styles.withSep} ${styles.sepNarrow}`}>
            <div className={styles.label}>상품명</div>
            <input
              type="text"
              className={styles.textInput}
              placeholder="상품명을 입력하세요"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
            />
          </div>

          {/* 가격 범위 */}
          <div className={`${styles.field} ${styles.priceField} ${styles.withSep} ${styles.sepNarrow}`}>
            <div className={styles.label}>가격 범위</div>
            <div className={styles.priceInputs}>
              <div className={styles.priceInputWrap}>
                <span className={styles.currency}>₩</span>
                <input
                  type="text"
                  inputMode="numeric"
                  className={styles.priceInput}
                  placeholder="최소"
                  value={minPrice}
                  onChange={handleMinChange}
                />
              </div>
              <span className={styles.tilde}>~</span>
              <div className={styles.priceInputWrap}>
                <span className={styles.currency}>₩</span>
                <input
                  type="text"
                  inputMode="numeric"
                  className={styles.priceInput}
                  placeholder="최대"
                  value={maxPrice}
                  onChange={handleMaxChange}
                />
              </div>
            </div>
          </div>

          {/* CTA */}
          <button type="button" className={styles.searchBtn} onClick={onSearch}>
            <Icon icon="solar:magnifer-zoom-in-broken" className={styles.searchIcon} />
            상품 찾기
          </button>
        </div>
      </div>
    </section>
  );
};

export default MainHeroSection;