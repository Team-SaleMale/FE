// src/api/hotdeals/buildRegistrationPayload.js

// "YYYY-MM-DDTHH:mm" (분까지) 로 포맷
function toMinuteLocalString(input) {
  if (!input) return "";

  const s = String(input).trim();

  // 이미 "YYYY-MM-DDTHH:mm" 형식이면 그대로 사용
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) return s;

  // 그 외(Date 등)는 한 번 Date로 파싱해서 포맷
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "";

  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

/**
 * 🔵 핫딜 등록 payload 생성
 * 백엔드 스펙:
 * { name, description?, startPrice, endDateTime, imageUrls }
 */
export function buildHotdealRegistrationPayload({
  product,
  schedule,
  imageUrls = [],
} = {}) {
  // name: 공백 정리 + 30자 제한 (경매 등록과 동일 정책)
  const name = String(product?.title || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 30);

  // description: 선택값 (없으면 아예 안 보냄)
  const description = String(product?.desc || "").trim();

  // startPrice: 숫자 변환
  const startPrice = Number(product?.price || 0);

  // endDateTime: datetime-local 값 → "YYYY-MM-DDTHH:mm" 형식
  const endDateTime = toMinuteLocalString(schedule?.endsAt);

  // imageUrls: truthy 값만 남기고 URL 인코딩
  const urls = (imageUrls || [])
    .filter(Boolean)
    .map((u) => encodeURI(String(u).trim()));

  const payload = {
    name,
    startPrice,
    endDateTime,
    imageUrls: urls,
  };

  if (description) {
    payload.description = description;
  }

  return payload;
}

export default buildHotdealRegistrationPayload;
