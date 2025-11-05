// src/api/auth/service.js
// NOTE(ChatGPT): 아래 코드는 백엔드 스펙에 맞춰 수정되었습니다.
// - 닉네임 중복 확인: 응답 result.exists (true=이미 존재, false=사용 가능) 정확 파싱
// - 소셜 회원가입 완료: OAuth2 완료 엔드포인트는 인증 없이 호출되어야 하므로 getNoAuth 사용
//   (client.js에 getNoAuth 추가 및 X-Skip-Auth 처리 필요; 아래 주석 참조)

import endpoints from "../endpoints";
import { get, post, patch, getNoAuth } from "../client"; 
// NOTE(ChatGPT): getNoAuth가 없다면 client.js에 아래 2가지를 추가하세요.
// 1) request 인터셉터에서 cfg.headers["X-Skip-Auth"]가 있으면 Authorization 헤더를 붙이지 않도록 처리
// 2) export const getNoAuth = (url, params={}, options={}) => api.get(url, { params, ...options, headers: { ...(options.headers||{}), "X-Skip-Auth": "1" } }).then(r => r.data)

/* =========================
 * Auth: 기본 API
 * ========================= */
export const register = (payload) => post(endpoints.AUTH.REGISTER, payload);
export const login    = (payload) => post(endpoints.AUTH.LOGIN, payload);
export const refresh  = (payload = {}) => post(endpoints.AUTH.REFRESH, payload);
export const logout   = () => patch(endpoints.AUTH.LOGOUT, {});
export const me       = () => get(endpoints.AUTH.ME);

/* =========================
 * 닉네임 중복 확인
 * - 서버 응답: { isSuccess, code, message, result: { exists: boolean | "true"/"false" | 0/1 } }
 * - exists === true  → 이미 존재(사용 불가)
 * - exists === false → 미존재(사용 가능)
 * ========================= */
const toBoolExists = (v) => {
  if (v === true || v === false) return v;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "true") return true;
    if (s === "false") return false;
    if (s === "1") return true;
    if (s === "0") return false;
  }
  if (typeof v === "number") return v === 1;
  return !!v; // 그 외는 truthy/falsy
};

export const checkNickname = (nickname) =>
  get(endpoints.AUTH.CHECK_NICK, { value: String(nickname || "").trim() })
    .then((res) => {
      const rawExists = res?.result?.exists;
      const exists = toBoolExists(rawExists);
      return { available: !exists };
    });

/* =========================
 * 이메일 중복 확인
 * - 다양한 키를 대응 (isDuplicated/duplicated/exists/isExists)
 * ========================= */
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

/* =========================
 * 이메일 인증
 * ========================= */
export const requestEmailCode = (email) =>
  get(endpoints.AUTH.EMAIL_VERIFY_REQUEST, { email });

export const verifyEmailCode = (email, code) =>
  post(endpoints.AUTH.EMAIL_VERIFY_CONFIRM, { email, code });

/* =========================
 * OAuth2 소셜 회원가입 완료
 * - 스펙: GET /auth/oauth2/login?signupToken=&nickname=&regionId=
 * - 이 엔드포인트는 "익명"으로 호출되어야 함 (Authorization 헤더 X)
 * - 반드시 getNoAuth 사용
 * ========================= */
export const completeSocialSignup = (params) =>
  getNoAuth(endpoints.AUTH.OAUTH2_COMPLETE, params);
