// src/api/client.js
import axios from "axios";
import { Cookies } from "react-cookie";
import config from "../config";

const cookies = new Cookies();
const ACCESS_TOKEN_KEY = "accessToken";

/* -------------------- util -------------------- */
function serializeParams(params = {}) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v == null) return;
    if (Array.isArray(v)) v.forEach((vv) => vv != null && usp.append(k, String(vv)));
    else usp.append(k, String(v));
  });
  return usp.toString();
}

function saveToken(token) {
  if (!token) return;
  try {
    cookies.set(ACCESS_TOKEN_KEY, token, { path: "/" });
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch {}
}
function clearToken() {
  try {
    cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {}
}

function extractTokenFromHeader(h) {
  if (!h) return null;
  const s = String(h).trim();
  return s.startsWith("Bearer ") ? s.slice(7) : s;
}

/* ✅ 외부에서 로그인 여부 확인용 */
export const getAccessToken = () => {
  try {
    return cookies.get(ACCESS_TOKEN_KEY) || localStorage.getItem(ACCESS_TOKEN_KEY) || null;
  } catch {
    return localStorage.getItem(ACCESS_TOKEN_KEY) || null;
  }
};
export const isAuthenticated = () => !!getAccessToken();

/* -------------------- axios -------------------- */
const api = axios.create({
  baseURL:
    config?.API_URL ||
    (typeof import.meta !== "undefined" &&
      import.meta.env &&
      import.meta.env.VITE_API_BASE_URL) ||
    process.env.REACT_APP_API_URL ||
    "",
  withCredentials: true,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
  paramsSerializer: { serialize: serializeParams },
});

/* -------------------- no-auth route -------------------- */
const NO_AUTH_EXACT = new Set([
  "/auth/register",
  "/auth/login",
  "/auth/refresh",
  "/auth/check/email",
  "/auth/check/nickname",
  "/auth/password/reset",
  "/auth/password/reset/verify",
  // "/auth/password/reset/confirm",  // [주의] 최종 단계는 Authorization 임시 토큰 필요 → no-auth 제외
  "/auth/email/verify/request",
  "/auth/email/verify/confirm",
  // 공개 검색 엔드포인트 중 가격 히스토리만 토큰 미주입
  // [추가 주석] 공개 검색 엔드포인트는 토큰 미주입(401 방지)
  "/search/price-history",
]);
const NO_AUTH_PREFIX: string[] = [];

/* -------------------- request interceptor -------------------- */
api.interceptors.request.use(
  (cfg) => {
    const url = cfg.url || "";
    const path = url.split("?")[0] || "";

    const wantsCreds =
      cfg.withCredentials === true ||
      cfg.headers?.["X-Allow-Credentials"] === "1" ||
      path === "/auth/login" ||
      path === "/auth/refresh";

    // X-Skip-Auth가 있으면 토큰 완전히 스킵
    if (cfg.headers?.["X-Skip-Auth"]) {
      cfg.withCredentials = !!wantsCreds;
      delete cfg.headers["X-Skip-Auth"];
      delete cfg.headers["X-Allow-Credentials"];
      delete cfg.headers.Authorization;
      return cfg;
    }

    const isNoAuth = NO_AUTH_EXACT.has(path) || NO_AUTH_PREFIX.some((p) => path.startsWith(p));

    // FormData면 Content-Type 제거
    const isFormData = typeof FormData !== "undefined" && cfg.data instanceof FormData;
    if (isFormData) {
      delete cfg.headers["Content-Type"];
      delete cfg.headers["content-type"];
    }

    // 인증 경로면 Authorization 주입
    // (feature/10-mypage-purchase-sales) 인증 경로 → Authorization 주입
    // NOTE: 위 isNoAuth 판단으로 무인증 경로는 제외됨. X-Skip-Auth가 있으면 일찍 반환됨.
    // cookie/localStorage 모두 체크하여 토큰 설정
    if (!isNoAuth) {
      const cookieToken = cookies.get(ACCESS_TOKEN_KEY);
      const lsToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      const token = cookieToken || lsToken;
      if (token) cfg.headers.Authorization = `Bearer ${token}`;
      cfg.withCredentials = true;
    }

    return cfg;
  },
  (err) => Promise.reject(err)
);

/* -------------------- response interceptor -------------------- */
const validateContentType = (response) => {
  const ct = (response.headers?.["content-type"] || "").toLowerCase();
  const st = response.status;
  if (st === 204) return;
  if (
    ct.includes("application/json") ||
    ct.includes("application/problem+json") ||
    ct.includes("text/")
  )
    return;
  if (
    ct.includes("multipart/") ||
    ct.includes("image/") ||
    ct.includes("octet-stream")
  )
    return;
  throw new Error("서버 응답이 올바르지 않습니다.");
};

const friendly = (error) => {
  const d = error?.response?.data;
  return (
    d?.message ||
    d?.error?.message ||
    d?.errorMessage ||
    error?.message ||
    "요청 실패"
  );
};

api.interceptors.response.use(
  (res) => {
    try {
      validateContentType(res);
    } catch (e) {
      console.error(e?.message || e);
    }

    // body/header에서 accessToken 자동 저장
    try {
      const data = res?.data || {};
      let token = data?.result?.accessToken || data?.accessToken || null;
      if (!token)
        token = extractTokenFromHeader(
          res?.headers?.authorization || res?.headers?.Authorization
        );
      if (token) saveToken(token);
    } catch (e) {
      console.warn("[token save failed]", e);
    }
    return res;
  },
  (error) => {
    error.friendlyMessage = friendly(error);
    const status = error?.response?.status;
    const url = String(error?.config?.url || "");
    const path = url.split("?")[0] || "";
    if (status === 401 && path !== "/auth/login" && path !== "/auth/refresh") clearToken();
    return Promise.reject(error);
  }
);

/* -------------------- common calls -------------------- */
export const get = async (url, params = {}, options = {}) =>
  (await api.get(url, { params, ...options })).data;

export const post = async (url, data, options = {}) =>
  (await api.post(url, data, { ...options })).data;

export const put = async (url, data, options = {}) =>
  (await api.put(url, data, { ...options })).data;

export const del = async (url, options = {}) =>
  (await api.delete(url, options)).data;

export const patch = async (url, data, options = {}) =>
  (await api.patch(url, data, { ...options })).data;

// 🔵 multipart 전용
// 🔵 multipart 전용: Content-Type 명시 금지(=undefined)
export const postMultipart = async (url, formData, options = {}) => {
  const res = await api.post(url, formData, {
    headers: { "Content-Type": undefined },
    ...options,
  });
  return res.data;
};

/* -------------------- explicit no-auth helpers -------------------- */
export const postNoAuth = async (url, data = {}, options = {}) =>
  (
    await api.post(url, data, {
      withCredentials: options.withCredentials ?? false,
      ...options,
      headers: {
        "Content-Type": "application/json",
        "X-Skip-Auth": "1",
        ...(options.headers || {}),
      },
    })
  ).data;

export const getNoAuth = async (url, params = {}, options = {}) =>
  (
    await api.get(url, {
      params,
      withCredentials: options.withCredentials ?? false,
      ...options,
      headers: {
        "X-Skip-Auth": "1",
        ...(options.headers || {}),
      },
    })
  ).data;

export default api;
