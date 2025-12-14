// src/api/auctions/service.js
import endpoints from "../endpoints";
import { get, post, del, postMultipart } from "../client";
import { buildRegistrationPayload } from "./buildRegistrationPayload";

/* ---------- 공통 유틸 ---------- */
const looksEnum = (s) => typeof s === "string" && /^[A-Z0-9_]+$/.test(s);
const isPos = (v) => Number.isFinite(v) && v > 0;

/** UI → API 카테고리 매핑 */
const UI_TO_API_CATEGORY = {
  "home-appliance": "HOME_APPLIANCE",
  "health-food": "HEALTH_FOOD",
  "beauty": "BEAUTY",
  "food-processed": "FOOD_PROCESSED",
  "pet": "PET",
  "digital": "DIGITAL",
  "living-kitchen": "LIVING_KITCHEN",
  "women-acc": "WOMEN_ACC",
  "sports": "SPORTS",
  "plant": "PLANT",
  "game-hobby": "GAME_HOBBY",
  "ticket": "TICKET",
  "furniture": "FURNITURE",
  "book": "BOOK",
  "kids": "KIDS",
  "clothes": "CLOTHES",
  "etc": "ETC",
  // 별칭
  fashion: "CLOTHES",
  appliances: "HOME_APPLIANCE",
  collectibles: "GAME_HOBBY",
};

const UI_SORT_TO_API = {
  "": "CREATED_DESC",
  views: "VIEW_COUNT_DESC",
  priceLow: "PRICE_ASC",
  priceHigh: "PRICE_DESC",
  bids: "BID_COUNT_DESC",
  endingSoon: "END_TIME_ASC",
};

const TAB_TO_STATUS = {
  ongoing: "BIDDING",
  done: "COMPLETED",
  hot: "POPULAR",
  rec: "RECOMMENDED",
};

/* ---------- 정규화 ---------- */
function normalizeCategoriesArray(input) {
  const mapOne = (k) => {
    if (!k) return;
    const key = String(k).trim();
    if (looksEnum(key)) return key;
    return UI_TO_API_CATEGORY[key.toLowerCase()];
  };

  if (Array.isArray(input)) {
    const arr = input.map(mapOne).filter(Boolean);
    return arr.length ? arr : undefined;
  }
  if (typeof input === "string") {
    const parts = input
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(mapOne)
      .filter(Boolean);
    return parts.length ? parts : undefined;
  }
  return undefined;
}

function buildListParams(input = {}) {
  const out = {};

  // status / sort
  if (input.status) out.status = input.status;
  if (input.sort)
    out.sort = looksEnum(input.sort) ? input.sort : UI_SORT_TO_API[input.sort] || undefined;

  // price
  if (isPos(input.minPrice)) out.minPrice = Math.trunc(Number(input.minPrice));
  if (isPos(input.maxPrice)) out.maxPrice = Math.trunc(Number(input.maxPrice));

  // categories
  const arr = normalizeCategoriesArray(input.categories ?? input.category);
  if (arr) {
    out.categoriesArr = arr;          // API 전송용
    out.categories = arr.join(",");   // 로컬 후처리용
  }

  // tab/status 보정
  if (!out.status && input.tab) out.status = TAB_TO_STATUS[input.tab] || "BIDDING";
  if (!("minPrice" in out) && input.price && isPos(input.price.min))
    out.minPrice = Math.trunc(Number(input.price.min));
  if (!("maxPrice" in out) && input.price && isPos(input.price.max))
    out.maxPrice = Math.trunc(Number(input.price.max));

  out.status = out.status || "BIDDING";

  // paging: UI는 1-based, 서버는 0-based
  const uiPage = Number(input.page ?? 1);
  out.page = Math.max(0, uiPage - 1);
  out.size = Number(input.size ?? 20);

  // 기타 (radius 별칭 허용)
  out._q = String(input.q ?? input.query ?? "").trim();
  // ✅ radius 혹은 range 둘 다 허용
  out._range = input.range || input.radius; // VERY_NEAR | NEAR | MEDIUM | FAR | ALL

  if (!out.sort) delete out.sort;
  return out;
}

function normalizeListEnvelope(p) {
  if (!p?.result) {
    return {
      isSuccess: false,
      code: String(p?.code ?? "500"),
      message: p?.message ?? "Invalid response",
      result: {
        items: [],
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        size: 20,
        hasNext: false,
        hasPrevious: false,
      },
    };
  }
  return p;
}

/* ---------- 정렬 ---------- */
function getComparator(sortKey) {
  switch (sortKey) {
    case "VIEW_COUNT_DESC":
      return (a, b) => (b?.viewCount ?? 0) - (a?.viewCount ?? 0);
    case "PRICE_ASC":
      return (a, b) =>
        (a?.currentPrice ?? a?.startPrice ?? 0) - (b?.currentPrice ?? b?.startPrice ?? 0);
    case "PRICE_DESC":
      return (a, b) =>
        (b?.currentPrice ?? b?.startPrice ?? 0) - (a?.currentPrice ?? a?.startPrice ?? 0);
    case "BID_COUNT_DESC":
      return (a, b) => (b?.bidderCount ?? 0) - (a?.bidderCount ?? 0);
    case "END_TIME_ASC":
      return (a, b) =>
        new Date(a?.endTime ?? a?.endAt ?? a?.endsAt ?? 0) -
        new Date(b?.endTime ?? b?.endAt ?? b?.endsAt ?? 0);
    case "CREATED_DESC":
    default:
      return (a, b) =>
        new Date(b?.createdAt ?? b?.startTime ?? b?.startAt ?? 0) -
        new Date(a?.createdAt ?? a?.startTime ?? a?.startAt ?? 0);
  }
}

/* ---------- 아이템에서 카테고리 enum 읽기(방어적) ---------- */
function readCategoryEnum(it) {
  const c =
    it?.category ??
    it?.categoryEnum ??
    it?.categoryType ??
    it?.categoryCode ??
    it?.categoryKey ??
    it?.category_name ??
    (it?.categoryObj || null);

  if (typeof c === "string") return c.toUpperCase();

  if (c && typeof c === "object") {
    const v = c.enum ?? c.code ?? c.key ?? c.name ?? c.value;
    return typeof v === "string" ? v.toUpperCase() : "";
  }
  return "";
}

/* ---------- 서버 메타가 없을 때 대비용 후처리 ---------- */
function postProcessSearch(items, params, rawMeta = {}) {
  let out = Array.isArray(items) ? items.slice() : [];

  const serverAppliedCategory =
    Array.isArray(params.categoriesArr) && params.categoriesArr.length > 0;

  const hasAnyFilter = !!(
    params.categories || params.categoriesArr || params.minPrice || params.maxPrice || params.status || params._q
  );

  if (hasAnyFilter) {
    const catSet = !serverAppliedCategory
      ? (params.categoriesArr
          ? new Set(params.categoriesArr.map((s) => String(s).toUpperCase()))
          : (params.categories
              ? new Set(String(params.categories).split(",").map((s) => s.toUpperCase()))
              : null))
      : null;

    const now = Date.now();
    const q = (params._q || "").toLowerCase();

    out = out.filter((it) => {
      let ok = true;

      if (params.status === "BIDDING") {
        const end = it?.endTime ?? it?.endAt ?? it?.endsAt ?? null;
        ok = ok && (!end || new Date(end).getTime() > now);
      } else if (params.status === "COMPLETED") {
        const end = it?.endTime ?? it?.endAt ?? it?.endsAt ?? null;
        ok = ok && (it?.completed === true || (end && new Date(end).getTime() <= now));
      }

      if (ok && catSet) {
        const cat = readCategoryEnum(it);
        ok = !!cat && catSet.has(cat);
      }

      const price = Number(
        it?.currentPrice ?? it?.price?.current ?? it?.startPrice ?? it?.price?.start ?? 0
      );
      if (ok && isPos(params.minPrice)) ok = price >= params.minPrice;
      if (ok && isPos(params.maxPrice)) ok = price <= params.maxPrice;

      if (ok && q) {
        const t = String(it?.title ?? it?.name ?? "").toLowerCase();
        ok = t.includes(q);
      }

      return ok;
    });
  }

  if (params.sort) out.sort(getComparator(params.sort));

  const hasServerPaging =
    Number.isFinite(rawMeta.totalPages) && rawMeta.totalPages > 0;
  if (hasServerPaging) {
    return {
      items: out,
      totalElements: rawMeta.totalElements ?? 0,
      totalPages: rawMeta.totalPages ?? 1,
      currentPage: rawMeta.currentPage ?? (params.page ?? 0),
      size: rawMeta.size ?? (params.size ?? 20),
      hasNext: rawMeta.hasNext ?? false,
      hasPrevious: rawMeta.hasPrevious ?? false,
    };
  }

  const size = params.size ?? 20;
  const page0 = params.page ?? 0;
  const totalElements = out.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  const sliced = out.slice(page0 * size, page0 * size + size);

  return {
    items: sliced,
    totalElements,
    totalPages,
    currentPage: page0,
    size,
    hasNext: page0 + 1 < totalPages,
    hasPrevious: page0 > 0,
  };
}

/* ---------- 리스트(Core) ---------- */
export async function fetchAuctionList(opts = {}) {
  const params = buildListParams(opts);

  if (isPos(params.minPrice) && isPos(params.maxPrice) && params.minPrice > params.maxPrice) {
    return {
      isSuccess: true,
      code: "200",
      message: "OK",
      result: {
        items: [],
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        size: params.size ?? 20,
        hasNext: false,
        hasPrevious: false,
      },
    };
  }

  // ✅ 모든 목록 조회는 /search/items 사용
  const searchParams = { page: params.page, size: params.size };

  if (params._q) searchParams.q = params._q;

  // ✅ 카테고리: 배열로 전송 (서버가 필터 적용)
  if (Array.isArray(params.categoriesArr) && params.categoriesArr.length) {
    searchParams.categories = params.categoriesArr;
  }

  if (isPos(params.minPrice)) searchParams.minPrice = params.minPrice;
  if (isPos(params.maxPrice)) searchParams.maxPrice = params.maxPrice;
  if (params.sort) searchParams.sort = params.sort;
  if (params.status) searchParams.status = params.status;

  // 반경: VERY_NEAR | NEAR | MEDIUM | FAR | ALL
  if (typeof params._range === "string" && params._range) {
    searchParams.radius = params._range;
  }

  const res = await get(endpoints.SEARCH.ITEMS, searchParams);
  const env = normalizeListEnvelope(res);

  let items = [];
  const meta = env.result || {};
  if (Array.isArray(meta.items)) items = meta.items;
  else if (Array.isArray(meta.content)) items = meta.content;
  else if (Array.isArray(env.result)) items = env.result;

  const fixed = postProcessSearch(items, params, meta);
  return { isSuccess: true, code: "200", message: "OK", result: fixed };
}

/* ---------- 메인 Trending 전용(항상 radius=ALL) ---------- */
export async function fetchPopularAuctionsForMain({
  page = 1,
  size = 12,
  categories,
  minPrice,
  maxPrice,
  q,
} = {}) {
  const page0 = Math.max(0, Number(page ?? 1) - 1);
  const sizeN = Number(size ?? 12);
  const categoriesArr = normalizeCategoriesArray(categories);

  const searchParams = {
    page: page0,
    size: sizeN,
    status: "POPULAR",
    sort: "BID_COUNT_DESC",
    radius: "ALL",
  };
  if (Array.isArray(categoriesArr) && categoriesArr.length) searchParams.categories = categoriesArr;
  if (isPos(minPrice)) searchParams.minPrice = Math.trunc(Number(minPrice));
  if (isPos(maxPrice)) searchParams.maxPrice = Math.trunc(Number(maxPrice));
  const qStr = (q ?? "").trim();
  if (qStr) searchParams.q = qStr;

  const res = await get(endpoints.SEARCH.ITEMS, searchParams);
  const env = normalizeListEnvelope(res);

  let items = [];
  const meta = env.result || {};
  if (Array.isArray(meta.items)) items = meta.items;
  else if (Array.isArray(meta.content)) items = meta.content;
  else if (Array.isArray(env.result)) items = env.result;

  const fixed = postProcessSearch(
    items,
    {
      status: "POPULAR",
      sort: "BID_COUNT_DESC",
      page: page0,
      size: sizeN,
      categoriesArr,
      minPrice,
      maxPrice,
      _q: qStr,
    },
    meta
  );

  return { isSuccess: true, code: "200", message: "OK", result: fixed };
}

/* ---------- 메인 Ending 전용(항상 radius=ALL) ---------- */
export async function fetchEndingSoonAuctionsForMain({
  page = 1,
  size = 12,
  categories,
  minPrice,
  maxPrice,
  q,
} = {}) {
  const page0 = Math.max(0, Number(page ?? 1) - 1);
  const sizeN = Number(size ?? 12);
  const categoriesArr = normalizeCategoriesArray(categories);

  const searchParams = {
    page: page0,
    size: sizeN,
    status: "BIDDING",
    sort: "END_TIME_ASC",
    radius: "ALL",
  };
  if (Array.isArray(categoriesArr) && categoriesArr.length) searchParams.categories = categoriesArr;
  if (isPos(minPrice)) searchParams.minPrice = Math.trunc(Number(minPrice));
  if (isPos(maxPrice)) searchParams.maxPrice = Math.trunc(Number(maxPrice));
  const qStr = (q ?? "").trim();
  if (qStr) searchParams.q = qStr;

  const res = await get(endpoints.SEARCH.ITEMS, searchParams);
  const env = normalizeListEnvelope(res);

  let items = [];
  const meta = env.result || {};
  if (Array.isArray(meta.items)) items = meta.items;
  else if (Array.isArray(meta.content)) items = meta.content;
  else if (Array.isArray(env.result)) items = env.result;

  const fixed = postProcessSearch(
    items,
    {
      status: "BIDDING",
      sort: "END_TIME_ASC",
      page: page0,
      size: sizeN,
      categoriesArr,
      minPrice,
      maxPrice,
      _q: qStr,
    },
    meta
  );

  return { isSuccess: true, code: "200", message: "OK", result: fixed };
}

/* ---------- 메인 CategoryPopular 전용(항상 radius=ALL) ---------- */
export async function fetchCategoryPopularForMain({
  categoryKey,        // UI key(or enum) 단일 또는 배열
  categories,         // categoryKey 대신 배열/문자열도 허용
  page = 1,
  size = 12,
  minPrice,
  maxPrice,
  q,
} = {}) {
  const page0 = Math.max(0, Number(page ?? 1) - 1);
  const sizeN = Number(size ?? 12);

  // UI key 또는 enum 문자열/배열 모두 허용
  const rawCats = typeof categoryKey !== "undefined" ? categoryKey : categories;
  const categoriesArr = normalizeCategoriesArray(rawCats);

  const searchParams = {
    page: page0,
    size: sizeN,
    status: "POPULAR",
    sort: "BID_COUNT_DESC",
    radius: "ALL",
  };
  if (Array.isArray(categoriesArr) && categoriesArr.length) {
    searchParams.categories = categoriesArr;
  }
  if (isPos(minPrice)) searchParams.minPrice = Math.trunc(Number(minPrice));
  if (isPos(maxPrice)) searchParams.maxPrice = Math.trunc(Number(maxPrice));
  const qStr = (q ?? "").trim();
  if (qStr) searchParams.q = qStr;

  const res = await get(endpoints.SEARCH.ITEMS, searchParams);
  const env = normalizeListEnvelope(res);

  let items = [];
  const meta = env.result || {};
  if (Array.isArray(meta.items)) items = meta.items;
  else if (Array.isArray(meta.content)) items = meta.content;
  else if (Array.isArray(env.result)) items = env.result;

  const fixed = postProcessSearch(
    items,
    {
      status: "POPULAR",
      sort: "BID_COUNT_DESC",
      page: page0,
      size: sizeN,
      categoriesArr,
      minPrice,
      maxPrice,
      _q: qStr,
    },
    meta
  );

  return { isSuccess: true, code: "200", message: "OK", result: fixed };
}

/* ---------- 메인 Completed 전용(항상 radius=ALL) ---------- */
export async function fetchCompletedAuctionsForMain({
  page = 1,
  size = 12,
  categories,
  minPrice,
  maxPrice,
  q,
} = {}) {
  const page0 = Math.max(0, Number(page ?? 1) - 1);
  const sizeN = Number(size ?? 12);
  const categoriesArr = normalizeCategoriesArray(categories);

  const searchParams = {
    page: page0,
    size: sizeN,
    status: "COMPLETED",
    sort: "BID_COUNT_DESC",
    radius: "ALL",
  };
  if (Array.isArray(categoriesArr) && categoriesArr.length) searchParams.categories = categoriesArr;
  if (isPos(minPrice)) searchParams.minPrice = Math.trunc(Number(minPrice));
  if (isPos(maxPrice)) searchParams.maxPrice = Math.trunc(Number(maxPrice));
  const qStr = (q ?? "").trim();
  if (qStr) searchParams.q = qStr;

  const res = await get(endpoints.SEARCH.ITEMS, searchParams);
  const env = normalizeListEnvelope(res);

  let items = [];
  const meta = env.result || {};
  if (Array.isArray(meta.items)) items = meta.items;
  else if (Array.isArray(meta.content)) items = meta.content;
  else if (Array.isArray(env.result)) items = env.result;

  const fixed = postProcessSearch(
    items,
    {
      status: "COMPLETED",
      sort: "BID_COUNT_DESC",
      page: page0,
      size: sizeN,
      categoriesArr,
      minPrice,
      maxPrice,
      _q: qStr,
    },
    meta
  );

  return { isSuccess: true, code: "200", message: "OK", result: fixed };
}

/* ---------- 추천(상세 페이지용, 항상 radius=ALL) ---------- */
export async function fetchRecommendedAuctionsForDetail({
  page = 1,
  size = 8,
  categories,
  minPrice,
  maxPrice,
  q,
} = {}) {
  // 목록 공통 로직 재사용 + status / radius 고정
  return fetchAuctionList({
    status: "RECOMMENDED",
    range: "ALL",   // ➜ /search/items?radius=ALL
    page,
    size,
    categories,
    minPrice,
    maxPrice,
    q,
  });
}

/* ---------- 리스트(메인 섹션용 래퍼) ---------- */
export async function fetchPopularAuctions({ page = 1, size = 12, categories, minPrice, maxPrice } = {}) {
  return fetchAuctionList({
    status: "POPULAR",
    sort: "BID_COUNT_DESC",
    page,
    size,
    categories,
    minPrice,
    maxPrice,
  });
}

export async function fetchEndingSoonAuctions({ size = 12 } = {}) {
  return fetchAuctionList({
    status: "BIDDING",
    sort: "END_TIME_ASC",
    page: 1,
    size,
  });
}

export async function fetchCategoryPopular({ categoryKey, page = 1, size = 12 } = {}) {
  const categoriesArr = normalizeCategoriesArray(categoryKey);
  return fetchAuctionList({
    status: "POPULAR",
    sort: "BID_COUNT_DESC",
    page,
    size,
    categories: categoriesArr,
  });
}

export async function fetchCompletedAuctions({ page, size, categories, minPrice, maxPrice, sort } = {}) {
  return fetchAuctionList({
    status: "COMPLETED",
    sort,
    page,
    size,
    categories,
    minPrice,
    maxPrice,
  });
}

/* ---------- 상세/행동 ---------- */
export async function registerAuction(state, { imageUrls = [] } = {}) {
  const payload = buildRegistrationPayload(state, { imageUrls });
  return post(endpoints.AUCTIONS.REGISTER, payload);
}

export const fetchAuctionDetail = (itemId, { bidHistoryLimit } = {}) => {
  const idStr = String(itemId).replace(/^:+/, "");
  const params = {};
  if (Number.isFinite(bidHistoryLimit)) params.bidHistoryLimit = bidHistoryLimit;
  return get(endpoints.AUCTIONS.DETAIL(idStr), params);
};

export const likeAuction = (itemId) =>
  post(endpoints.AUCTIONS.LIKE(String(itemId).replace(/^:+/, "")), {});
export const unlikeAuction = (itemId) =>
  del(endpoints.AUCTIONS.UNLIKE(String(itemId).replace(/^:+/, "")));

export const fetchLikedAuctions = (params = {}) => get(endpoints.AUCTIONS.LIKED, params);

export const placeBid = (itemId, bidPrice) =>
  post(endpoints.AUCTIONS.BID(String(itemId).replace(/^:+/, "")), { bidPrice });

export async function uploadAuctionImages(files = []) {
  if (!Array.isArray(files) || files.length === 0) {
    return { result: { imageUrls: [], count: 0 } };
  }
  const fd = new FormData();
  files.forEach((f) => f instanceof File && fd.append("images", f));
  return postMultipart(endpoints.AUCTIONS.UPLOAD_IMAGES, fd);
}

export const suggestTitleFromImage = (imageUrl) =>
  post(endpoints.AUCTIONS.SUGGEST_TITLE, { imageUrl });

/* ---------- 마이페이지(프로필) ---------- */
// endpoints.USERS.PROFILE(권장) → 기타 키 → 최후 '/mypage'
const MYPAGE_ENDPOINT =
  endpoints?.USERS?.PROFILE ??
  endpoints?.MYPAGE?.ME ??
  endpoints?.MYPAGE ??
  endpoints?.USER?.MYPAGE ??
  "/mypage";

export const fetchMyProfile = () => get(MYPAGE_ENDPOINT, {});
