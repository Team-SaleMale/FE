/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "../../styles/AuctionList/AuctionList.module.css";

import Toolbar from "./Toolbar";
import FilterSidebar from "./FilterSidebar";
import Horizontal from "./Horizontal";
import Vertical from "./Vertical";
import Pagination from "./Pagination";

import { fetchAuctionList } from "../../api/auctions/service";

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
const STATUS_MAP = {
  ongoing: "BIDDING",
  done: "COMPLETED",
  hot: "POPULAR",
  rec: "RECOMMENDED",
};

/* 정렬키 ↔ sort 파라미터 */
const SORT_MAP = {
  "": "CREATED_DESC",
  views: "VIEW_COUNT_DESC",
  priceLow: "PRICE_ASC",
  priceHigh: "PRICE_DESC",
  bids: "BID_COUNT_DESC",
};
const REVERSE_SORT_MAP = Object.fromEntries(Object.entries(SORT_MAP).map(([k, v]) => [v, k]));

/* range → km 매핑(ALL은 전국) */
const RANGE_TO_KM = { VERY_NEAR: 2, NEAR: 5, MEDIUM: 20, FAR: 50, ALL: null };

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
const isClosed = (endAtISO, nowMs) => {
  if (!endAtISO) return false;
  return new Date(endAtISO).getTime() <= nowMs;
};

const ITEMS_PER_PAGE = 12;

export default function AuctionList() {
  const location = useLocation();
  const { search } = location;
  const navigate = useNavigate();

  const [layout, setLayout] = useState("horizontal");
  const [page, setPage] = useState(1);

  // 툴바 탭
  const [tab, setTab] = useState("ongoing");

  // 사이드바 필터
  const [categories, setCategories] = useState([]);
  const [price, setPrice] = useState({ min: 0, max: 0 });
  const [sort, setSort] = useState("");
  const [query, setQuery] = useState("");
  const [range, setRange] = useState("NEAR"); // VERY_NEAR|NEAR|MEDIUM|FAR|ALL

  // 서버 응답
  const [server, setServer] = useState({
    items: [],
    totalPages: 1,
    size: ITEMS_PER_PAGE,
    currentPage: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* URL → 초기 필터 */
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
    if (sortQ) {
      const ui = SORT_MAP.hasOwnProperty(sortQ) ? sortQ : (REVERSE_SORT_MAP[sortQ] ?? "");
      setSort(ui);
    } else {
      setSort("");
    }

    const r = qs.get("range");
    if (r) setRange(r);
  }, [search]);

  /* 1초 주기 타이머 */
  const [nowTick, setNowTick] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  /* 서버 요청 파라미터 (⚠ page는 1-based로 유지) */
  const serverParams = useMemo(() => {
    const q = (query || "").trim();
    const p = {
      status: STATUS_MAP[tab] || "BIDDING",
      page,                    // 1-based → service에서 0-based 변환
      size: ITEMS_PER_PAGE,
      sort: SORT_MAP[sort] ?? SORT_MAP[""],
      q,
      range,
    };

    if (range === "ALL") {
      p.includeOutside = true;
    } else if (range && range !== "NEAR") {
      p.includeOutside = false;
      const km = RANGE_TO_KM[range] ?? RANGE_TO_KM.NEAR;
      p.distanceKm = km;
    }

    if (categories?.length) {
      const enums = categories.map((k) => CAT_TO_ENUM[k]).filter(Boolean);
      if (enums.length) p.categories = enums;
    }
    if (Number.isFinite(price.min) && price.min > 0) p.minPrice = Math.trunc(price.min);
    if (Number.isFinite(price.max) && price.max > 0) p.maxPrice = Math.trunc(price.max);

    return p;
  }, [tab, categories, price.min, price.max, sort, page, query, range]);

  /* 목록 API */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchAuctionList(serverParams);
        if (!alive) return;
        if (res?.isSuccess) {
          const r = res.result || {};
          setServer({
            items: Array.isArray(r.items) ? r.items : [],
            totalPages: r.totalPages ?? 1,
            size: r.size ?? ITEMS_PER_PAGE,
            currentPage: r.currentPage ?? 0,
          });
        } else {
          throw new Error(res?.message || "API error");
        }
      } catch (e) {
        if (!alive) return;
        setError(e);
        setServer({ items: [], totalPages: 1, size: ITEMS_PER_PAGE, currentPage: 0 });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [serverParams]);

  /* 카드 VM — 응답 키 차이 방어(fallback) */
  const VM = useMemo(() => {
    const now = nowTick;
    return (server.items || [])
      .map((it) => {
        const endISO =
          it.endTime || it.endAt || it.endDate || it.endsAt || null;

        const imgs = Array.isArray(it.imageUrls)
          ? it.imageUrls
          : Array.isArray(it.images)
          ? it.images
          : [];
        const images = Array.from(new Set((imgs || []).filter(Boolean)));
        const cover = images[0] || it.thumbnailUrl || it.imageUrl || "";

        const closed = isClosed(endISO, now);
        const endsTodayOpen = !closed && isEndingTodayKST(endISO, now);

        const id =
          it.itemId ?? it.id ?? it.auctionId ?? it.productId ?? null;

        if (!id) return null; // id 없으면 스킵(렌더/라우팅 보호)

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

  /* 총 페이지 감소 시 현재 페이지 보정(안전장치) */
  useEffect(() => {
    if (page > totalPages) setPage(totalPages || 1);
  }, [totalPages, page]);

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
                setRange("NEAR");
                setQuery("");
                setPage(1);
                navigate({ pathname: location.pathname }, { replace: true });
              }}
            />
          </div>
        </aside>

        {/* 우측: 툴바 + 리스트 */}
        <div>
          <Toolbar
            activeTab={tab}
            onChangeTab={setTab}
            layout={layout}
            onToggleLayout={setLayout}
          />

          <main className={styles.main}>
            {loading && <div>불러오는 중…</div>}
            {error && <div>오류가 발생했어요. 잠시 후 다시 시도해 주세요.</div>}

            {!loading && !error && (
              <>
                {layout === "horizontal" ? (
                  <Horizontal items={VM} />
                ) : (
                  <Vertical items={VM} />
                )}

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
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
