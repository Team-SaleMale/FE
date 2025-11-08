// src/api/auctions/service.js
import endpoints from "../endpoints";
import { get, post, del, postMultipart } from "../client";
import { buildRegistrationPayload } from "./buildRegistrationPayload";

/* ===== 매핑 ===== */
const UI_TO_API_CATEGORY = {
  // 정식 UI 키
  "home-appliance": "HOME_APPLIANCE",
  "health-food":    "HEALTH_FOOD",
  "beauty":         "BEAUTY",
  "food-processed": "FOOD_PROCESSED",
  "pet":            "PET",
  "digital":        "DIGITAL",
  "living-kitchen": "LIVING_KITCHEN",
  "women-acc":      "WOMEN_ACC",
  "sports":         "SPORTS",
  "plant":          "PLANT",
  "game-hobby":     "GAME_HOBBY",
  "ticket":         "TICKET",
  "furniture":      "FURNITURE",
  "book":           "BOOK",
  "kids":           "KIDS",
  "clothes":        "CLOTHES", // 서버 enum이 FASHION이면 "FASHION"으로 변경
  "etc":            "ETC",

  // ✅ Featured 상세에서 사용하는 별칭 키(라우트 파라미터 보정용)
  //    동일 카테고리를 가리키도록 UI 키로도 허용
  "fashion":        "CLOTHES",         // = 의류
  "appliances":     "HOME_APPLIANCE",  // = 생활가전
  "collectibles":   "GAME_HOBBY",      // = 게임/취미/음반
};

const UI_SORT_TO_API = {
  views:     "VIEW_COUNT_DESC",
  priceLow:  "PRICE_ASC",
  priceHigh: "PRICE_DESC",
  bids:      "BID_COUNT_DESC",
  "":        undefined, // 미전송 시 서버 기본 CREATED_DESC
};

const TAB_TO_STATUS = {
  ongoing: "BIDDING",
  done:    "COMPLETED",
  hot:     "POPULAR",
  rec:     "RECOMMENDED",
};

/* ===== 유틸 ===== */
const isPos = (v) => Number.isFinite(v) && v > 0;
const looksEnum = (s) => typeof s === "string" && /^[A-Z0-9_]+$/.test(s);

/** 배열/문자 상관없이 서버 요구 포맷('A,B,C')으로 직렬화 */
function serializeCategories(input) {
  if (!input) return undefined;

  // 문자열/배열 관계없이 소문자 트리밍 후 매핑
  const mapOne = (k) => {
    if (!k) return undefined;
    const key = String(k).trim();
    if (!key) return undefined;
    // 이미 ENUM이면 그대로
    if (looksEnum(key)) return key;
    // 소문자 UI/별칭 → ENUM
    const lower = key.toLowerCase();
    return UI_TO_API_CATEGORY[lower];
  };

  if (Array.isArray(input)) {
    const enums = input.map(mapOne).filter(Boolean);
    return enums.length ? enums.join(",") : undefined;
  }

  if (typeof input === "string") {
    if (input.includes(",")) {
      const enums = input
        .split(",")
        .map((s) => mapOne(s))
        .filter(Boolean);
      return enums.length ? enums.join(",") : undefined;
    }
    const mapped = mapOne(input);
    return mapped ? mapped : undefined;
  }

  return undefined;
}

/** 신(정규화) 파라미터 우선, 구(탭/price) 파라미터도 허용 */
function buildListParams(input = {}) {
  const out = {};

  // 1) 신 파라미터 우선
  if (input.status) out.status = input.status;
  if (input.sort) out.sort = input.sort;
  if (isPos(input.minPrice)) out.minPrice = Math.trunc(Number(input.minPrice));
  if (isPos(input.maxPrice)) out.maxPrice = Math.trunc(Number(input.maxPrice));
  const catStr1 = serializeCategories(input.categories);
  if (catStr1) out.categories = catStr1;

  // 2) 구버전 입력 보정
  if (!out.status && input.tab) out.status = TAB_TO_STATUS[input.tab] || "BIDDING";
  if (!out.sort && typeof input.sort === "string" && !looksEnum(input.sort)) {
    const s = UI_SORT_TO_API[input.sort];
    if (s) out.sort = s;
  }
  if (!out.categories && input.category) {
    const catStr2 = serializeCategories(input.category);
    if (catStr2) out.categories = catStr2;
  }
  if (!("minPrice" in out) && input.price && isPos(input.price.min)) {
    out.minPrice = Math.trunc(Number(input.price.min));
  }
  if (!("maxPrice" in out) && input.price && isPos(input.price.max)) {
    out.maxPrice = Math.trunc(Number(input.price.max));
  }

  // 기본값
  out.status = out.status || "BIDDING";
  const uiPage = Number(input.page ?? 1);
  out.page = Math.max(0, uiPage - 1);
  out.size = Number(input.size ?? 20);

  // 정렬은 지정된 경우만 전송
  if (out.sort === undefined || out.sort === null || out.sort === "") {
    delete out.sort;
  }

  return out;
}

function normalizeListEnvelope(payload) {
  if (!payload?.result) {
    return {
      isSuccess: false,
      code: String(payload?.code ?? "500"),
      message: payload?.message ?? "Invalid response",
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
  return payload;
}

/* ===== API: 공용 리스트 ===== */
export async function fetchAuctionList(opts = {}) {
  const params = buildListParams(opts);

  // min > max 방지: 즉시 빈 결과
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

  const res = await get(endpoints.AUCTIONS.LIST, params);
  return normalizeListEnvelope(res);
}

/** 실시간 인기 경매: POPULAR + BID_COUNT_DESC */
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

/** 오늘(Asia/Seoul) 마감 예정 경매: 프론트에서 필터링/정렬 */
export async function fetchEndingTodayAuctions({ size = 60 } = {}) {
  const res = await fetchAuctionList({
    status: "BIDDING",
    page: 1,
    size,
  });
  return res; // 컴포넌트에서 endTime 기준으로 '오늘 마감' 필터/정렬
}

/** 카테고리별 인기 상품: 카테고리 1개 + POPULAR + BID_COUNT_DESC */
export async function fetchCategoryPopular({ categoryKey, page = 1, size = 12 } = {}) {
  const categories = serializeCategories(categoryKey); // UI 키/ENUM/별칭 모두 허용
  return fetchAuctionList({
    status: "POPULAR",
    sort: "BID_COUNT_DESC",
    page,
    size,
    categories,
  });
}

/** 입찰 완료된 상품: COMPLETED */
export async function fetchCompletedAuctions({ page = 1, size = 12, categories, minPrice, maxPrice, sort } = {}) {
  return fetchAuctionList({
    status: "COMPLETED",
    sort, // 예: "END_TIME_DESC" 지원 시 전달, 없으면 서버 기본 사용
    page,
    size,
    categories,
    minPrice,
    maxPrice,
  });
}

/* ===== 상세/행동 ===== */
export async function registerAuction(state, { imageUrls = [] } = {}) {
  const payload = buildRegistrationPayload(state, { imageUrls });
  return post(endpoints.AUCTIONS.REGISTER, payload);
}

export async function fetchAuctionDetail(itemId, options = {}) {
  const cleaned = String(itemId).replace(/^:+/, "");
  if (!cleaned) throw new Error("fetchAuctionDetail: itemId는 필수입니다.");

  const { bidHistoryLimit = 10 } = options;
  const url = endpoints.AUCTIONS.DETAIL(cleaned);
  const payload = await get(url, { bidHistoryLimit });
  return normalizeAuctionDetail(payload);
}

function normalizeAuctionDetail(payload) {
  if (!payload?.result) return payload;
  const r = payload.result;

  const images = Array.isArray(r.images)
    ? [...r.images].sort((a, b) => (a.imageOrder ?? 0) - (b.imageOrder ?? 0))
    : [];

  const bidHistory = Array.isArray(r.bidHistory)
    ? [...r.bidHistory].sort((a, b) => new Date(b.bidTime) - new Date(a.bidTime))
    : [];

  return {
    ...payload,
    result: {
      ...r,
      images,
      bidHistory,
      highestBidder: r.highestBidder ?? null,
      userInteraction: r.userInteraction ?? { isLiked: false, likeCount: 0 },
    },
  };
}

export const likeAuction   = (itemId) => post(endpoints.AUCTIONS.LIKE(itemId), {});
export const unlikeAuction = (itemId) => del(endpoints.AUCTIONS.UNLIKE(itemId));
export const fetchLikedAuctions = (params = {}) =>
  get(endpoints.AUCTIONS.LIKED, params);

export const placeBid = (itemId, bidPrice) =>
  post(endpoints.AUCTIONS.BID(itemId), { bidPrice });

export async function uploadAuctionImages(files = []) {
  if (!Array.isArray(files) || files.length === 0) {
    return { result: { imageUrls: [], count: 0 } };
  }
  const fd = new FormData();
  files.forEach((f) => f && fd.append("images", f));
  return postMultipart(endpoints.AUCTIONS.UPLOAD_IMAGES, fd);
}

export const suggestTitleFromImage = (imageUrl) =>
  post(endpoints.AUCTIONS.SUGGEST_TITLE, { imageUrl });


/* ===== [추가] 검색 파라미터 & 공통 래핑 ===== */

/** 검색 파라미터: 서버가 0-based면 page-1로 보정 */
function buildSearchParams(input = {}) {
  const q = (input.q ?? "").toString().trim();
  const uiPage = Number(input.page ?? 1);
  const size = Number(input.size ?? 20);
  return {
    q,
    page: Math.max(0, uiPage - 1),
    size,
  };
}

/** 다양한 리스트 응답을 통일: {result:{items,totalElements,totalPages,...}} 형태로 변환 */
function normalizeListFromPayload(payload, fallbackSize = 20) {
  const box = payload?.result ?? payload ?? {};
  const items =
    box.items ??
    box.content ??
    box.list ??
    [];
  const size =
    box.size ??
    box.pageSize ??
    (Number.isFinite(fallbackSize) ? fallbackSize : items.length || 20);
  const totalElements =
    box.totalElements ??
    box.total ??
    box.count ??
    items.length;
  const totalPages =
    box.totalPages ??
    box.pageInfo?.totalPages ??
    (totalElements ? Math.ceil(totalElements / size) : 0);
  const currentPage =
    box.currentPage ??
    box.page ??
    box.pageNumber ??
    box.pageIndex ??
    0;

  return {
    isSuccess: payload?.isSuccess ?? true,
    code: String(payload?.code ?? "200"),
    message: payload?.message ?? "OK",
    result: {
      items,
      totalElements,
      totalPages,
      currentPage,
      size,
      hasNext: currentPage + 1 < totalPages,
      hasPrevious: currentPage > 0,
    },
  };
}

/* ===== [추가] 검색 API: /search/items (액세스 토큰 필요) ===== */
export async function searchAuctionItems({ q, page = 1, size = 20 } = {}) {
  const params = buildSearchParams({ q, page, size });
  const res = await get(endpoints.SEARCH.ITEMS, params);
  return normalizeListFromPayload(res, params.size);
}
