// src/pages/AuctionList/AuctionList.js
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "../../styles/AuctionList/AuctionList.module.css";

import Toolbar from "./Toolbar";
import FilterSidebar from "./FilterSidebar";
import Horizontal from "./Horizontal";
import Vertical from "./Vertical";
import Pagination from "./Pagination";

import { fetchAuctionList, fetchMyProfile } from "../../api/auctions/service";
import { isAuthenticated } from "../../api/client";

/* 사이드바 고정 카테고리 */
const CATEGORIES = [
  { key: "all", label: "전체" },
  { key: "home-appliance", label: "생활가전", icon: "solar:washing-machine-minimalistic-linear" },
  { key: "health-food",   label: "건강기능식품", icon: "solar:dumbbell-large-minimalistic-linear" },
  { key: "beauty",        label: "뷰티/미용", icon: "solar:magic-stick-3-linear" },
  { key: "food-processed",label: "가공식품", icon: "solar:chef-hat-linear" },
  { key: "pet",           label: "반려동물", icon: "solar:cat-linear" },
  { key: "digital",       label: "디지털 기기", icon: "solar:laptop-minimalistic-linear" },
  { key: "living-kitchen",label: "생활/주방", icon: "solar:whisk-linear" },
  { key: "women-acc",     label: "여성잡화", icon: "solar:bag-smile-outline" },
  { key: "sports",        label: "스포츠/레저", icon: "solar:balls-linear" },
  { key: "plant",         label: "식물", icon: "solar:waterdrop-linear" },
  { key: "game-hobby",    label: "게임/취미/음반", icon: "solar:reel-2-broken" },
  { key: "ticket",        label: "티켓", icon: "solar:ticket-sale-linear" },
  { key: "furniture",     label: "가구/인테리어", icon: "solar:armchair-2-linear" },
  { key: "book",          label: "도서", icon: "solar:notebook-broken" },
  { key: "kids",          label: "유아동", icon: "solar:smile-circle-linear" },
  { key: "clothes",       label: "의류", icon: "solar:hanger-broken" },
  { key: "etc",           label: "기타", icon: "solar:add-square-broken" },
];

/* UI key → 서버 enum */
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
const ENUM_TO_CAT = Object.fromEntries(Object.entries(CAT_TO_ENUM).map(([k, v]) => [v, k]));

/* 탭 → status */
const STATUS_MAP = { ongoing: "BIDDING", done: "COMPLETED", hot: "POPULAR", rec: "RECOMMENDED" };

/* 정렬키 ↔ sort */
const SORT_MAP = {
  "": "CREATED_DESC",
  views: "VIEW_COUNT_DESC",
  priceLow: "PRICE_ASC",
  priceHigh: "PRICE_DESC",
  bids: "BID_COUNT_DESC",
};
const REVERSE_SORT_MAP = Object.fromEntries(Object.entries(SORT_MAP).map(([k, v]) => [v, k]));

const to2 = (n) => String(n).padStart(2, "0");
const timeLeftFrom = (endAtISO, nowMs) => {
  const endMs = endAtISO ? new Date(endAtISO).getTime() : 0;
  const diff = endMs - nowMs;
  if (diff <= 0) return "0일 00:00:00";
  const sec = Math.floor(diff / 1000);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${d}일 ${to2(h)}:${to2(m)}:${to2(s)}`;
};
const ymdTZ = (dateLike, timeZone = "Asia/Seoul") => {
  if (!dateLike) return null;
  const d = typeof dateLike === "string" ? new Date(dateLike) : dateLike;
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" });
  return fmt.format(d).replaceAll("-", "/");
};
const isEndingTodayKST = (endAtISO, nowMs) =>
  !!endAtISO && ymdTZ(new Date(nowMs), "Asia/Seoul") === ymdTZ(endAtISO, "Asia/Seoul");
const isClosed = (endAtISO, nowMs) => !endAtISO ? false : new Date(endAtISO).getTime() <= nowMs;

const ITEMS_PER_PAGE = 12;

/* 디바운스 훅 */
function useDebouncedValue(value, delay = 220) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function AuctionList() {
  const location = useLocation();
  const { search } = location;
  const navigate = useNavigate();

  const authed = isAuthenticated?.() ?? !!localStorage.getItem("accessToken");

  const [layout, setLayout] = useState("horizontal");
  const [page, setPage] = useState(1);

  // 탭
  const [tab, setTab] = useState("ongoing");

  // 필터
  const [categories, setCategories] = useState([]);
  const [price, setPrice] = useState({ min: 0, max: 0 });
  const [sort, setSort] = useState("");
  const [query, setQuery] = useState("");
  const [range, setRange] = useState(authed ? "NEAR" : "ALL");

  // 서버 응답
  const [server, setServer] = useState({ items: [], totalPages: 1, size: ITEMS_PER_PAGE, currentPage: 0 });
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  // 지역 라벨
  const [regionText, setRegionText] = useState("로그인 후 확인가능합니다");

  /* URL → 초기값 */
  useEffect(() => {
    const qs = new URLSearchParams(search);

    const tabQ = qs.get("tab") || "ongoing";
    setTab(["ongoing", "done", "hot", "rec"].includes(tabQ) ? tabQ : "ongoing");

    const q = qs.get("q") || qs.get("query") || "";
    setQuery(q);

    const uiCat = qs.get("cat");
    const enums = (qs.get("categories") || "").split(",").map((s) => s.trim()).filter(Boolean);
    const uiCatsFromEnum = enums.map((e) => ENUM_TO_CAT[e]).filter(Boolean);
    const nextCats = [];
    if (uiCat && uiCat !== "all") nextCats.push(uiCat);
    uiCatsFromEnum.forEach((c) => { if (!nextCats.includes(c)) nextCats.push(c); });
    setCategories(nextCats);

    const min = Number(qs.get("min") || qs.get("minPrice") || 0);
    const max = Number(qs.get("max") || qs.get("maxPrice") || 0);
    setPrice({
      min: Number.isFinite(min) && min > 0 ? Math.trunc(min) : 0,
      max: Number.isFinite(max) && max > 0 ? Math.trunc(max) : 0,
    });

    const sortQ = qs.get("sort");
    setSort(sortQ ? (SORT_MAP.hasOwnProperty(sortQ) ? sortQ : (REVERSE_SORT_MAP[sortQ] ?? "")) : "");

    if (authed) {
      const r = qs.get("range") || qs.get("radius") || "NEAR";
      setRange(["VERY_NEAR","NEAR","MEDIUM","FAR","ALL"].includes(r) ? r : "NEAR");
    } else {
      setRange("ALL");
    }
  }, [search, authed]);

  /* 1초 타이머 */
  const [nowTick, setNowTick] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  /* 프로필 지역 불러오기 */
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!authed) { setRegionText("로그인 후 확인가능합니다"); return; }
      try {
        const res = await fetchMyProfile();
        if (!alive) return;
        const payload = res?.result || {};
        const regions = payload?.regions || [];
        let label = "";
        if (Array.isArray(regions) && regions.length) {
          const r0 = regions[0] || {};
          label = [r0.sido, r0.sigungu, r0.eupmyeondong].filter(Boolean).join(" ");
        }
        setRegionText(label || "지역 정보 없음");
      } catch {
        if (alive) setRegionText("지역 정보 없음");
      }
    })();
    return () => { alive = false; };
  }, [authed]);

  /* 서버 요청 파라미터 */
  const serverParams = useMemo(() => {
    const q = (query || "").trim();
    const p = {
      status: STATUS_MAP[tab] || "BIDDING",
      page,
      size: ITEMS_PER_PAGE,
      sort: SORT_MAP[sort] ?? SORT_MAP[""],
      q,
      range: authed ? range : "ALL",
      _auth: authed,
    };

    if (categories?.length) {
      const enums = categories.map((k) => CAT_TO_ENUM[k]).filter(Boolean);
      if (enums.length) p.categories = enums;
    }
    if (Number.isFinite(price.min) && price.min > 0) p.minPrice = Math.trunc(price.min);
    if (Number.isFinite(price.max) && price.max > 0) p.maxPrice = Math.trunc(price.max);

    return p;
  }, [tab, categories, price.min, price.max, sort, page, query, range, authed]);

  /* 디바운스 */
  const debouncedParams = useDebouncedValue(serverParams, 220);

  /* 목록 API */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setIsFetching(true);
        setError(null);
        const res = await fetchAuctionList(debouncedParams);
        if (!alive) return;
        if (res?.isSuccess) {
          const r = res.result || {};
          setServer((prev) => ({
            items: Array.isArray(r.items) ? r.items : [],
            totalPages: r.totalPages ?? prev.totalPages ?? 1,
            size: r.size ?? prev.size ?? ITEMS_PER_PAGE,
            currentPage: r.currentPage ?? prev.currentPage ?? 0,
          }));
        } else {
          throw new Error(res?.message || "API error");
        }
      } catch (e) {
        if (!alive) return;
        setError(e);
      } finally {
        if (alive) setIsFetching(false);
      }
    })();
    return () => { alive = false; };
  }, [debouncedParams]);

  /* 카드 VM */
  const VM = useMemo(() => {
    const now = nowTick;
    return (server.items || [])
      .map((it) => {
        const endISO = it.endTime || it.endAt || it.endDate || it.endsAt || null;

        const imgs = Array.isArray(it.imageUrls)
          ? it.imageUrls
          : Array.isArray(it.images)
          ? it.images
          : [];
        const images = Array.from(new Set((imgs || []).filter(Boolean)));
        const cover = images[0] || it.thumbnailUrl || it.imageUrl || "";

        const closed = isClosed(endISO, now);
        const endsTodayOpen = !closed && isEndingTodayKST(endISO, now);

        const id = it.itemId ?? it.id ?? it.auctionId ?? it.productId ?? null;
        if (!id) return null;

        return {
          id,
          title: it.title ?? "",
          images: images.length ? images : (cover ? [cover] : []),
          imageUrls: images,
          thumbnailUrl: cover || null,
          startAtISO: it.createdAt || it.startTime || it.startAt || null,
          endAtISO: endISO,
          startAt: (it.createdAt || it.startTime || it.startAt) ? ymdTZ(it.createdAt || it.startTime || it.startAt, "Asia/Seoul") : null,
          endAt: endISO ? ymdTZ(endISO, "Asia/Seoul") : null,
          timeLeft: timeLeftFrom(endISO, now),
          isClosed: closed,
          isEndingTodayOpen: endsTodayOpen,
          startPrice: it.startPrice ?? it.price?.start ?? null,
          currentPrice: it.currentPrice ?? it.price?.current ?? it.currentBid ?? 0,
          views: it.viewCount ?? it.views ?? 0,
          bidders: it.bidderCount ?? it.bidders ?? it.bidCount ?? 0,
        };
      })
      .filter(Boolean);
  }, [server.items, nowTick]);

  /* 탭/필터 변경 → 1페이지 */
  useEffect(() => { setPage(1); }, [tab, categories, price.min, price.max, sort, query, range]);

  const totalPages = server.totalPages || 1;

  /* 총 페이지 감소 보정 */
  useEffect(() => {
    if (page > totalPages) setPage(totalPages || 1);
  }, [totalPages, page]);

  const isEmpty = !VM.length && !isFetching && !error;

  return (
    <div className={styles.page}>
      <div className={styles.body}>
        {/* 좌측: sticky 필터 */}
        <aside className={styles.aside}>
          <div className={styles.asideScroller}>
            <FilterSidebar
              categories={CATEGORIES}
              activeCategories={categories}
              price={price}
              sort={sort}
              query={query}
              range={range}
              showRange={authed}
              onChangeRange={setRange}
              onChangeQuery={setQuery}
              onChangeCategories={setCategories}
              onChangePrice={setPrice}
              onChangeSort={setSort}
              onClear={() => {
                setCategories([]);
                setPrice({ min: 0, max: 0 });
                setSort("");
                setTab("ongoing");
                setRange(authed ? "NEAR" : "ALL");
                setQuery("");
                setPage(1);
                navigate({ pathname: location.pathname }, { replace: true });
              }}
              /* ✅ 지역 라벨 전달 */
              regionText={regionText}
            />
          </div>
        </aside>

        {/* 우측: 툴바 + 리스트 (가로폭 살짝 제한) */}
        <div className={styles.right}>
          <Toolbar
            activeTab={tab}
            onChangeTab={setTab}
            layout={layout}
            onToggleLayout={setLayout}
          />

          <main className={styles.main}>
            {error && <div>오류가 발생했어요. 잠시 후 다시 시도해 주세요.</div>}

            <div className={styles.listWrap}>
              {layout === "horizontal" ? (
                <Horizontal items={VM} />
              ) : (
                <Vertical items={VM} />
              )}

              {isFetching && (
                <div className={styles.loadingOverlay}>
                  <div className={styles.spinner} aria-label="불러오는 중" />
                </div>
              )}

              {isEmpty && <div className={styles.empty}>조건에 맞는 상품이 없어요.</div>}
            </div>

            {totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                onChange={(p) => {
                  setPage(p);
                  if (typeof window !== "undefined") {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
