// src/api/priceSuggestion/service.js
// "가격 추천" UX에서 쓰는 2개 API(네이버 시세/가격 추천)를 한 곳에 묶어 재사용성을 높입니다.

import endpoints from "../endpoints";
import { get, post } from "../client";

/**
 * 네이버 쇼핑 가격 검색
 * GET /api/v1/search/naver?query=...&limit=10
 */
export async function fetchNaverShoppingPrices(query, limit = 10) {
  const q = String(query ?? "").trim();
  if (!q) throw new Error("검색어(query)가 비어있습니다.");

  // 네이버 검색은 비교적 빠른 편이라 20초면 충분
  return get(
    endpoints.SEARCH.NAVER_SHOPPING,
    { query: q, limit },
    { timeout: 20000 }
  );
}

/**
 * 초기 가격 추천(서버 분석)
 * POST /auctions/price-suggestion { productName }
 */
export async function fetchPriceSuggestion(productName) {
  const name = String(productName ?? "").trim();
  if (!name) throw new Error("상품명(productName)이 비어있습니다.");

  // 이 API는 오래 걸릴 수 있으니 타임아웃을 늘립니다.
  return post(
    endpoints.AUCTIONS.PRICE_SUGGESTION,
    { productName: name },
    { timeout: 60000 }
  );
}
