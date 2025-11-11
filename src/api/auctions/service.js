// src/api/auctions/service.js
import endpoints from "../endpoints";
import { get, post, del, postMultipart } from "../client";
import { buildRegistrationPayload } from "./buildRegistrationPayload";

/* ---------- 리스트 공통 ---------- */
const looksEnum = (s) => typeof s === "string" && /^[A-Z0-9_]+$/.test(s);

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

const TAB_TO_STATUS = { ongoing: "BIDDING", done: "COMPLETED", hot: "POPULAR", rec: "RECOMMENDED" };
const isPos = (v) => Number.isFinite(v) && v > 0;

function serializeCategories(input) {
  if (!input) return undefined;
  const mapOne = (k) => {
    if (!k) return;
    const key = String(k).trim();
    if (looksEnum(key)) return key;
    return UI_TO_API_CATEGORY[key.toLowerCase()];
  };
  if (Array.isArray(input)) {
    const v = input.map(mapOne).filter(Boolean);
    return v.length ? v.join(",") : undefined;
  }
  if (typeof input === "string") {
    if (input.includes(",")) {
      const v = input.split(",").map(mapOne).filter(Boolean);
      return v.length ? v.join(",") : undefined;
    }
    return mapOne(input) || undefined;
  }
  return undefined;
}

function buildListParams(input = {}) {
  const out = {};
  if (input.status) out.status = input.status;
  if (input.sort) out.sort = looksEnum(input.sort) ? input.sort : UI_SORT_TO_API[input.sort] || undefined;

  if (isPos(input.minPrice)) out.minPrice = Math.trunc(Number(input.minPrice));
  if (isPos(input.maxPrice)) out.maxPrice = Math.trunc(Number(input.maxPrice));

  const cats = serializeCategories(input.categories ?? input.category);
  if (cats) out.categories = cats;

  if (!out.status && input.tab) out.status = TAB_TO_STATUS[input.tab] || "BIDDING";
  if (!("minPrice" in out) && input.price && isPos(input.price.min)) out.minPrice = Math.trunc(Number(input.price.min));
  if (!("maxPrice" in out) && input.price && isPos(input.price.max)) out.maxPrice = Math.trunc(Number(input.price.max));

  out.status = out.status || "BIDDING";
  const uiPage = Number(input.page ?? 1);
  out.page = Math.max(0, uiPage - 1);
  out.size = Number(input.size ?? 20);

  out._q = String(input.q ?? input.query ?? "").trim();
  out._range = input.range;

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
        new Date(a?.endTime ?? a?.endAt ?? 0) - new Date(b?.endTime ?? b?.endAt ?? 0);
    case "CREATED_DESC":
    default:
      return (a, b) => new Date(b?.createdAt ?? 0) - new Date(a?.createdAt ?? 0);
  }
}

function postProcessSearch(items, params, rawMeta = {}) {
  let out = Array.isArray(items) ? items.slice() : [];

  if (params.categories || params.minPrice || params.maxPrice || params.status) {
    const catSet = params.categories ? new Set(String(params.categories).split(",")) : null;
    out = out.filter((it) => {
      let ok = true;
      if (params.status === "BIDDING") {
        ok = ok && (!it?.endTime || new Date(it.endTime) > new Date());
      } else if (params.status === "COMPLETED") {
        ok = ok && (it?.completed === true || (it?.endTime && new Date(it.endTime) <= new Date()));
      }
      if (ok && catSet) {
        const cat = String(it?.category || it?.categoryEnum || "").toUpperCase();
        ok = catSet.has(cat);
      }
      const price = Number(it?.currentPrice ?? it?.startPrice ?? 0);
      if (ok && isPos(params.minPrice)) ok = price >= params.minPrice;
      if (ok && isPos(params.maxPrice)) ok = price <= params.maxPrice;
      return ok;
    });
  }

  if (params.sort) out.sort(getComparator(params.sort));

  const hasServerPaging = Number.isFinite(rawMeta.totalPages) && rawMeta.totalPages > 0;
  if (hasServerPaging) {
    return {
      items: out,
      totalElements: rawMeta.totalElements ?? 0,
      totalPages: rawMeta.totalPages ?? 1,
      currentPage: rawMeta.currentPage ?? params.page ?? 0,
      size: rawMeta.size ?? params.size ?? 20,
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

  const isSearchMode = !!params._q || (typeof params._range === "string" && params._range !== "NEAR");

  if (isSearchMode) {
    const searchParams = {
      q: params._q,
      keyword: params._q,
      page: params.page,
      size: params.size,
    };
    if (params.minPrice) searchParams.minPrice = params.minPrice;
    if (params.maxPrice) searchParams.maxPrice = params.maxPrice;
    if (params.categories) searchParams.categories = params.categories;
    if (params.sort) searchParams.sort = params.sort;

    const res = await get(endpoints.SEARCH.ITEMS, searchParams);
    const env = normalizeListEnvelope(res);

    let items = [];
    let meta = env.result || {};
    if (Array.isArray(meta.items)) items = meta.items;
    else if (Array.isArray(meta.content)) items = meta.content;
    else if (Array.isArray(env.result)) items = env.result;

    const fixed = postProcessSearch(items, params, meta);
    return { isSuccess: true, code: "200", message: "OK", result: fixed };
  }

  const { _q, _range, ...listParams } = params;
  const res = await get(endpoints.AUCTIONS.LIST, listParams);
  return normalizeListEnvelope(res);
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
  const categories = serializeCategories(categoryKey);
  return fetchAuctionList({
    status: "POPULAR",
    sort: "BID_COUNT_DESC",
    page,
    size,
    categories,
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

/** 상세조회 */
export const fetchAuctionDetail = (itemId, { bidHistoryLimit } = {}) => {
  const idStr = String(itemId).replace(/^:+/, "");
  const params = {};
  if (Number.isFinite(bidHistoryLimit)) params.bidHistoryLimit = bidHistoryLimit;
  return get(endpoints.AUCTIONS.DETAIL(idStr), params);
};

/** ✅ 찜/취소 (POST / DELETE) */
export const likeAuction   = (itemId) =>
  post(endpoints.AUCTIONS.LIKE(String(itemId).replace(/^:+/, "")), {});
export const unlikeAuction = (itemId) =>
  del(endpoints.AUCTIONS.UNLIKE(String(itemId).replace(/^:+/, "")));

export const fetchLikedAuctions = (params = {}) => get(endpoints.AUCTIONS.LIKED, params);

/** ✅ 입찰 */
export const placeBid = (itemId, bidPrice) =>
  post(endpoints.AUCTIONS.BID(String(itemId).replace(/^:+/, "")), { bidPrice });

/** 이미지 업로드 */
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
