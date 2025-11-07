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

// NOTE(ChatGPT): accessToken 저장/삭제 유틸
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

// NOTE(ChatGPT): Authorization 헤더에서 토큰 추출
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
    import.meta?.env?.VITE_API_BASE_URL ||
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

// =================== 응답 인터셉터 ===================
api.interceptors.response.use(
  (response) => {
    // NOTE(ChatGPT): 로그인/리프레시 응답 시 헤더의 Authorization 수거
    const authHeader = response.headers?.authorization || response.headers?.Authorization;
    const token = extractTokenFromHeader(authHeader);
    if (token) {
      saveToken(token);
      console.log("[client.js] Authorization 헤더에서 accessToken 저장됨");
    }
    return response;
  },
  (error) => {
    const status = error?.response?.status;
    if (status === 401) clearToken();
    else if (status >= 500) console.error("서버 에러:", error);
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
