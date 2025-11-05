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
  clothes: "CLOTHES" || "FASHION",       // 서버 enum 이름이 CLOTHES라면 그대로, FASHION이면 위를 FASHION으로 교체
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

/* 탭 → status (명세 준수) */
const STATUS_MAP = {
  ongoing: "BIDDING",
  done: "COMPLETED",
  hot: "POPULAR",
  rec: "RECOMMENDED",
};

/* 정렬키 → sort 파라미터 */
const SORT_MAP = {
  "": "CREATED_DESC",
  views: "VIEW_COUNT_DESC",
  priceLow: "PRICE_ASC",
  priceHigh: "PRICE_DESC",
  bids: "BID_COUNT_DESC",
};

const to2 = (n) => String(n).padStart(2, "0");
const timeLeftFrom = (endAtISO, nowMs) => {
  const diff = new Date(endAtISO).getTime() - nowMs;
  if (diff <= 0) return "0일 00:00:00";
  const sec = Math.floor(diff / 1000);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${d}일 ${to2(h)}:${to2(m)}:${to2(s)}`;
};
const ymdTZ = (dateLike, timeZone = "Asia/Seoul") => {
  const d = typeof dateLike === "string" ? new Date(dateLike) : dateLike;
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
  });
  return fmt.format(d).replaceAll("-", "/");
};
const isEndingTodayKST = (endAtISO, nowMs) =>
  ymdTZ(new Date(nowMs), "Asia/Seoul") === ymdTZ(endAtISO, "Asia/Seoul");
const isClosed = (endAtISO, nowMs) => new Date(endAtISO).getTime() <= nowMs;

const ITEMS_PER_PAGE = 6; // 요구: 6개씩

export default function AuctionList() {
  const location = useLocation();
  const { search } = location;
  const navigate = useNavigate();

  const [layout, setLayout] = useState("horizontal");
  const [page, setPage] = useState(1); // UI용 1-based

  // 툴바 탭
  const [tab, setTab] = useState("ongoing");

  // 사이드바 필터
  const [categories, setCategories] = useState([]); // 다중 선택
  const [price, setPrice] = useState({ min: 0, max: 0 });
  const [sort, setSort] = useState(""); // 기본 최신순은 서버 기본값 CREATED_DESC
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
  const [query, setQuery] = useState("");

  // 서버 응답
  const [server, setServer] = useState({
    items: [],
    totalPages: 1,
    size: ITEMS_PER_PAGE,
    currentPage: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* URL → 초기 필터 (선택) */
  useEffect(() => {
    const qs = new URLSearchParams(search);
    const tabQ = qs.get("tab") || "ongoing";
    setTab(["ongoing", "done", "hot", "rec"].includes(tabQ) ? tabQ : "ongoing");
  }, [search]);

  /* 남은 시간 1초 주기 갱신 */
  const [nowTick, setNowTick] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  /* ===== 서버 요청 파라미터 =====
     - status: 탭과 연동
     - categories: 다중 배열 (UI → enum)
     - minPrice/maxPrice: 0이면 미전송
     - sort: 미선택 시 기본 CREATED_DESC
     - page: 서버 0-based로 변환
     - size: 6
  */
  const serverParams = useMemo(() => {
    const p = {
      status: STATUS_MAP[tab] || "BIDDING",
      page: Math.max(0, page - 1),
      size: ITEMS_PER_PAGE,
      sort: SORT_MAP[sort] ?? SORT_MAP[""],
    };

    if (categories?.length) {
      const enums = categories
        .map((k) => CAT_TO_ENUM[k])
        .filter(Boolean);
      if (enums.length) p.categories = enums;
    }

    if (Number.isFinite(price.min) && price.min > 0) p.minPrice = Math.trunc(price.min);
    if (Number.isFinite(price.max) && price.max > 0) p.maxPrice = Math.trunc(price.max);

    return p;
  }, [tab, categories, price.min, price.max, sort, page]);

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
            currentPage: (r.currentPage ?? 0),
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

  /* 서버 → 카드 VM */
  const VM = useMemo(() => {
    const now = nowTick;
    return (server.items || []).map((it) => {
      const endISO = it.endTime;
      const imgs = Array.isArray(it.imageUrls) ? it.imageUrls.filter(Boolean) : [];
      const images = Array.from(new Set(imgs));
      const cover = images[0] || it.thumbnailUrl || it.imageUrl || "";

      const closed = isClosed(endISO, now);
      const endsTodayOpen = !closed && isEndingTodayKST(endISO, now);

      return {
        id: it.itemId,
        title: it.title ?? "",
        images: images.length ? images : (cover ? [cover] : []),
        imageUrls: images,
        thumbnailUrl: cover || null,
        startAtISO: it.createdAt || null,
        endAtISO: endISO,
        startAt: it.createdAt ? ymdTZ(it.createdAt, "Asia/Seoul") : null,
        endAt: ymdTZ(endISO, "Asia/Seoul"),
        timeLeft: timeLeftFrom(endISO, now),
        isClosed: closed,
        isEndingTodayOpen: endsTodayOpen,
        startPrice: it.startPrice ?? null,
        currentPrice: it.currentPrice ?? 0,
        views: it.viewCount ?? 0,
        bidders: it.bidderCount ?? 0,
      };
    });
  }, [server.items, nowTick]);

  /* 탭/필터 바뀌면 1페이지로 */
  useEffect(() => { setPage(1); }, [tab, categories, price.min, price.max, sort]);

  /* 전체 페이지 계산은 서버 응답 사용 */
  const totalPages = server.totalPages || 1;

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
              onChangeQuery={setQuery}           // (검색은 프론트 필터 — 필요 시 서버 검색 연동)
              onChangeCategories={setCategories} // ★ 다중 카테고리
              onChangePrice={setPrice}
              onChangeSort={setSort}
              onClear={() => {
                setCategories([]);
                setPrice({ min: 0, max: 0 });
                setSort("");
                setTab("ongoing");
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
