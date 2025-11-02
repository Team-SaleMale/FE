// src/api/auctions/service.js
import endpoints from "../endpoints";
import { get, post, del, postMultipart } from "../client";
import { buildRegistrationPayload } from "./buildRegistrationPayload";

/** 경매 등록 (JSON POST) */
export async function registerAuction(state, { imageUrls = [] } = {}) {
  const payload = buildRegistrationPayload(state, { imageUrls });
  return post(endpoints.AUCTIONS.REGISTER, payload);
}

/**
 * 경매 상세 조회
 * @param {number|string} itemId
 * @param {{ bidHistoryLimit?: number }} options
 */
export async function fetchAuctionDetail(itemId, options = {}) {
  const cleaned = String(itemId).replace(/^:+/, "");
  if (!cleaned) throw new Error("fetchAuctionDetail: itemId는 필수입니다.");

  const { bidHistoryLimit = 10 } = options;
  const url = endpoints.AUCTIONS.DETAIL(cleaned);
  const payload = await get(url, { bidHistoryLimit });
  return normalizeAuctionDetail(payload);
}

/** UI 후처리(정렬/널가드) */
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

/** 찜/취소/목록 */
export const likeAuction   = (itemId) => post(endpoints.AUCTIONS.LIKE(itemId), {});
export const unlikeAuction = (itemId) => del(endpoints.AUCTIONS.UNLIKE(itemId));
export const fetchLikedAuctions = (params = {}) =>
  get(endpoints.AUCTIONS.LIKED, params);

/**
 * 입찰
 * @returns 서버 원본 응답(result 포함)
 * result 예시:
 * {
 *   transactionId, itemId, buyerId, bidPrice,
 *   previousPrice, currentHighestPrice, bidIncrement,
 *   bidCount, bidTime, remainingTimeInSeconds
 * }
 */
export const placeBid = (itemId, bidPrice) =>
  post(endpoints.AUCTIONS.BID(itemId), { bidPrice });

/** 이미지 업로드 (multipart/form-data) */
export async function uploadAuctionImages(files = []) {
  if (!Array.isArray(files) || files.length === 0) {
    return { result: { imageUrls: [], count: 0 } };
  }
  const fd = new FormData();
  files.forEach((f) => f && fd.append("images", f));
  return postMultipart(endpoints.AUCTIONS.UPLOAD_IMAGES, fd);
}

/** 이미지 AI 분석 → 제목/카테고리 제안 */
export const suggestTitleFromImage = (imageUrl) =>
  post(endpoints.AUCTIONS.SUGGEST_TITLE, { imageUrl });
