// src/api/auctions/buildRegistrationPayload.js
// 등록 화면의 상태 → 서버 요구 JSON (POST /auctions/registration)
import { CATEGORY_TO_ENUM, TRADE_TO_ENUM } from "../constants/mapping";

// "YYYY-MM-DDTHH:mm" (분까지) 로 포맷
function toMinuteLocalString(input) {
  if (!input) return "";
  const s = String(input);
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) return s; // 이미 분까지만 있으면 그대로 사용
  const d = new Date(input);
  if (isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function buildRegistrationPayload(state, { imageUrls = [] } = {}) {
  // 1) 카테고리(단일)
  const uiCategory = state?.categories?.[0];
  const category = CATEGORY_TO_ENUM[uiCategory] ?? "ETC";

  // 2) 거래 방식(다중) + 과거 단일값 병합
  const mergedTrades = new Set([
    ...(Array.isArray(state?.tradeMethods) ? state.tradeMethods : []),
    ...(state?.tradeMethod ? [state.tradeMethod] : []),
  ]);
  const tradeMethods = [...mergedTrades]
    .map((k) => TRADE_TO_ENUM[k] ?? null)
    .filter(Boolean); // 예: ['IN_PERSON','SHIPPING']

  // 3) 기타 상세는 OTHER일 때만 포함
  const hasOther = tradeMethods.includes("OTHER");
  const tradeDetails = hasOther ? (state?.tradeNote || "").trim() : undefined;

  // 4) 종료시간 ("YYYY-MM-DDTHH:mm")
  const endDateTime = toMinuteLocalString(state?.endDate);

  // 5) 이미지 URL (공백/한글 등 안전하게 인코딩)
  const urls = (imageUrls || [])
    .filter(Boolean)
    .map((u) => encodeURI(String(u).trim()));

  return {
    title: (state?.title || "").trim(),
    name: (state?.modelName || "").trim(),
    description: state?.description || "",
    category,                 // 예) 'DIGITAL'
    startPrice: Number(state?.startPrice || 0),
    endDateTime,              // 예) '2025-12-20T18:00'
    tradeMethods,             // 예) ['IN_PERSON','SHIPPING']
    ...(tradeDetails ? { tradeDetails } : {}),
    imageUrls: urls,          // 예) ['https://.../temp/xxx.png' (encodeURI 적용)]
  };
}

export default buildRegistrationPayload;
