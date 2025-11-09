import { CATEGORY_TO_ENUM, TRADE_TO_ENUM } from "../constants/mapping";

// "YYYY-MM-DDTHH:mm" (분까지) 로 포맷
function toMinuteLocalString(input) {
  if (!input) return "";
  const s = String(input);
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) return s;
  const d = new Date(input);
  if (isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function buildRegistrationPayload(state, { imageUrls = [] } = {}) {
  const uiCategory = state?.categories?.[0];
  const category = CATEGORY_TO_ENUM[uiCategory] ?? "ETC";

  const mergedTrades = new Set([
    ...(Array.isArray(state?.tradeMethods) ? state.tradeMethods : []),
    ...(state?.tradeMethod ? [state.tradeMethod] : []),
  ]);
  const tradeMethods = [...mergedTrades]
    .map((k) => TRADE_TO_ENUM[k] ?? null)
    .filter(Boolean);

  const hasOther = tradeMethods.includes("OTHER");
  const tradeDetails = hasOther ? (state?.tradeNote || "").trim() : undefined;

  const endDateTime = toMinuteLocalString(state?.endDate);
  const urls = (imageUrls || []).filter(Boolean).map((u) => encodeURI(String(u).trim()));

  // ✅ name은 항상 AI 인식 모델명만 사용 + 30자 제한
  const name = String(state?.name || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 30);

  return {
    // 필수
    name,
    category,
    startPrice: Number(state?.startPrice || 0),
    endDateTime,
    tradeMethods,
    ...(tradeDetails ? { tradeDetails } : {}),
    imageUrls: urls,

    // 선택(서버가 허용하면 전달)
    title: String(state?.title || "").trim().slice(0, 30), // 제목도 30자 방어
    description: state?.description || "",
  };
}

export default buildRegistrationPayload;
