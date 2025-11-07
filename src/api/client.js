// src/api/client.js
import axios from "axios";
import { Cookies } from "react-cookie";
import config from "../config";

const cookies = new Cookies();
const ACCESS_TOKEN_KEY = "accessToken";

// =================== 공통 유틸 ===================
function serializeParams(params = {}) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (Array.isArray(v)) {
      v.forEach((vv) => vv != null && usp.append(k, String(vv)));
    } else {
      usp.append(k, String(v));
    }
  });
  return usp.toString();
}

// NOTE: accessToken 저장/삭제 유틸
function saveToken(token) {
  if (!token || typeof token !== "string") return;
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

// NOTE: Authorization 헤더에서 토큰 추출
function extractTokenFromHeader(headerVal) {
  if (!headerVal) return null;
  const val = String(headerVal).trim();
  if (val.startsWith("Bearer ")) return val.slice(7);
  return val;
}

// =================== axios 인스턴스 ===================
const api = axios.create({
  baseURL:
    config?.API_URL ||
    (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
    process.env.REACT_APP_API_URL ||
    "",
  withCredentials: true,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
  paramsSerializer: { serialize: serializeParams },
});

// =================== 무인증 경로 ===================
const NO_AUTH_PATHS = [
  "/auth/email/verify/request",
  "/auth/email/verify/confirm",
  "/auth/check/email",
  "/auth/check/nickname",
  "/auth/register",
  "/auth/login",
  "/auth/password/reset",
  "/auth/password/reset/verify",
  "/auth/password/reset/confirm",
  "/auctions",
  "/search/items",
  "/auth/refresh",
];

// =================== 요청 인터셉터 ===================
api.interceptors.request.use(
  (cfg) => {
    const url = cfg.url || "";
    const wantsCreds =
      cfg.withCredentials === true ||
      cfg.headers?.["X-Allow-Credentials"] === "1" ||
      url.includes("/auth/login") ||
      url.includes("/auth/refresh");

    // X-Skip-Auth 지정 시 건너뛰기
    if (cfg.headers?.["X-Skip-Auth"]) {
      cfg.withCredentials = !!wantsCreds;
      delete cfg.headers["X-Skip-Auth"];
      if (!wantsCreds) delete cfg.headers.Authorization;
      delete cfg.headers["X-Allow-Credentials"];
      return cfg;
    }

    // 무인증 경로
    if (NO_AUTH_PATHS.some((p) => url.includes(p))) {
      cfg.withCredentials = !!wantsCreds;
      if (!wantsCreds) delete cfg.headers.Authorization;
      delete cfg.headers["X-Allow-Credentials"];
      return cfg;
    }

    // 인증 경로 → Authorization 주입
    const cookieToken = cookies.get(ACCESS_TOKEN_KEY);
    const lsToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const token = cookieToken || lsToken;
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
  },
  (err) => Promise.reject(err)
);

// =================== 응답 Content-Type 검증 ===================
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

// =================== 에러 메시지 안전 추출 ===================
const extractFriendlyMessage = (error) => {
  const data = error?.response?.data;
  return (
    data?.message ||
    data?.error?.message ||
    data?.errorMessage ||
    error?.message ||
    "요청 실패"
  );
};

// =================== 응답 인터셉터 ===================
api.interceptors.response.use(
  (response) => {
    try {
      validateContentType(response);
    } catch (e) {
      console.error(e?.message || e);
    }

    // ✅ 응답에서 accessToken 자동 추출 및 저장 (body 우선, 없으면 header)
    try {
      const data = response?.data || {};
      let token =
        data?.result?.accessToken ||
        data?.accessToken ||
        null;
      if (!token) {
        const h = response?.headers?.authorization || response?.headers?.Authorization;
        token = extractTokenFromHeader(h);
      }
      if (token && typeof token === "string") {
        console.log("[Interceptor] accessToken detected:", token.slice(0, 20) + "…");
        saveToken(token);
      }
    } catch (err) {
      console.error("[Interceptor] token auto-save failed:", err);
    }

    return response;
  },
  (error) => {
    error.friendlyMessage = extractFriendlyMessage(error);

    if (error.response) {
      const status = error.response.status;
      const url = String(error.config?.url || "");
      switch (status) {
        case 401: {
          const hadAuth = !!error.config?.headers?.Authorization;
          const isAuthRoute = url.includes("/auth/login") || url.includes("/auth/refresh");
          if (hadAuth && !isAuthRoute) {
            console.warn("[Interceptor][401] clearing token from:", url);
            clearToken();
          } else {
            console.warn("[Interceptor][401] skip clear for:", url);
          }
          break;
        }
        case 403:
          console.error("접근 권한이 없습니다.");
          break;
        case 404:
          console.error("요청한 리소스를 찾을 수 없습니다.");
          break;
        case 500:
          console.error("서버 에러가 발생했습니다.");
          break;
        default:
          console.error("에러가 발생했습니다:", error.response.data);
      }
    } else if (error.request) {
      console.error("서버로부터 응답이 없습니다.");
    } else {
      console.error("요청 중 에러가 발생했습니다:", error.message);
    }

    return Promise.reject(error);
  }
);

// =================== 공통 요청 함수 ===================
export const get = async (url, params = {}, options = {}) => {
  const res = await api.get(url, { params, ...options });
  return res.data;
};
export const post = async (url, data, options = {}) => {
  const res = await api.post(url, data, { ...options });
  return res.data;
};
export const put = async (url, data, options = {}) => {
  const res = await api.put(url, data, { ...options });
  return res.data;
};
export const del = async (url, options = {}) => {
  const res = await api.delete(url, options);
  return res.data;
};
export const patch = async (url, data, options = {}) => {
  const res = await api.patch(url, data, { ...options });
  return res.data;
};
export const postMultipart = async (url, formData, options = {}) => {
  const res = await api.post(url, formData, { headers: {}, ...options });
  return res.data;
};

// ✅ 무인증 호출
export const postNoAuth = async (url, data = {}, options = {}) => {
  const res = await api.post(url, data, {
    withCredentials: options.withCredentials ?? false,
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Skip-Auth": "1",
      ...(options.headers || {}),
    },
  });
  return res.data;
};
export const getNoAuth = async (url, params = {}, options = {}) => {
  const res = await api.get(url, {
    params,
    withCredentials: options.withCredentials ?? false,
    ...options,
    headers: {
      "X-Skip-Auth": "1",
      ...(options.headers || {}),
    },
  });
  return res.data;
};

export default api;
