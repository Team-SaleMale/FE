import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import styles from "../../styles/Main/MainHeroSection.module.css";

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

  const [activeCat, setActiveCat] = useState("all");
  const [address] = useState("경기도 고양시 항공대로~");

  const [keyword, setKeyword] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const handleMinChange = (e) => setMinPrice(withCommas(e.target.value));
  const handleMaxChange = (e) => setMaxPrice(withCommas(e.target.value));

  const onSearch = () => {
    // 가격 정규화
    let min = Number(onlyDigits(minPrice)) || 0;
    let max = Number(onlyDigits(maxPrice)) || 0;
    if (min > 0 && max > 0 && min > max) [min, max] = [max, min];

    const qs = new URLSearchParams();
    qs.set("tab", "ongoing"); // 진행 중 기준

    // 카테고리/가격 필터(둘 다 /auctions에서도, /search/items에서도 의미 있음)
    if (activeCat && activeCat !== "all") {
      const catEnum = CAT_TO_ENUM[activeCat];
      // 구버전/신버전 호환 위해 둘 다 세팅
      qs.set("cat", activeCat);
      if (catEnum) qs.set("categories", catEnum);
    }
    if (min > 0) {
      qs.set("min", String(min));
      qs.set("minPrice", String(min)); // 호환
    }
    if (max > 0) {
      qs.set("max", String(max));
      qs.set("maxPrice", String(max)); // 호환
    }

    // 🔑 핵심 분기: 검색어가 있으면 q를 넣어 리스트 페이지가 /search/items로 분기
    const qTrim = keyword.trim();
    if (qTrim) {
      qs.set("q", qTrim);       // 신 로직
      qs.set("query", qTrim);   // 과거 호환
    }

    // 결과 페이지로 이동(분기는 AuctionList의 fetchAuctionList가 q 유무로 처리)
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
          <div className={styles.field}>
            <div className={styles.label}>현재 거주 지역</div>
            <div className={styles.addressText}>{address}</div>
          </div>

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
