// src/api/auth/service.js
import endpoints from "../endpoints";
import { get, post, patch, getNoAuth, postNoAuth } from "../client";

// ===== Auth (일반) =====
export const register = (payload) => postNoAuth(endpoints.AUTH.REGISTER, payload);
export const login    = (payload) => postNoAuth(endpoints.AUTH.LOGIN, payload);
export const refresh  = (payload = {}) => post(endpoints.AUTH.REFRESH, payload);
export const logout   = () => patch(endpoints.AUTH.LOGOUT, {});
export const me       = () => get(endpoints.AUTH.ME);

// ===== Validation =====
export const checkNickname = (nickname) =>
  get(endpoints.AUTH.CHECK_NICK, { value: String(nickname || "").trim() })
    .then((res) => {
      const raw = res?.result?.exists;
      const exists =
        raw === true || raw === "true" || raw === 1 || raw === "1"; // 안전 파싱
      return { available: !exists };
    });

export const checkEmail = (email) =>
  get(endpoints.AUTH.CHECK_EMAIL, { value: email }).then((res) => {
    const r = res?.result || {};
    const isDuplicated =
      (typeof r.isDuplicated === "boolean" && r.isDuplicated) ||
      (typeof r.duplicated === "boolean" && r.duplicated) ||
      (typeof r.exists === "boolean" && r.exists) ||
      (typeof r.isExists === "boolean" && r.isExists);
    const available = !isDuplicated;
    if (!Object.keys(r).length && res?.message) {
      const msg = res.message.toLowerCase();
      if (msg.includes("중복") || msg.includes("이미")) return { available: false };
      if (msg.includes("가능")) return { available: true };
    }
    return { available };
  });

// ===== Email verify =====
export const requestEmailCode = (email) =>
  getNoAuth(endpoints.AUTH.EMAIL_VERIFY_REQUEST, { email });

export const verifyEmailCode = (email, code) =>
  postNoAuth(endpoints.AUTH.EMAIL_VERIFY_CONFIRM, { email, code });

// ===== Social signup complete (@RequestParam 기반: query 전송) =====
export async function completeSocialSignup({ signupToken, nickname, regionId }) {
  const qs = new URLSearchParams({
    signupToken,
    nickname,
    regionId: String(regionId),
  }).toString();
  // 바디 없이 POST (쿼리 파라미터로 전달)
  return post(`${endpoints.AUTH.SOCIAL_COMPLETE}?${qs}`);
}
