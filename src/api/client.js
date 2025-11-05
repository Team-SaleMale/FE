// src/api/client.js
import axios from "axios";
import { Cookies } from "react-cookie";
import config from "../config";

const cookies = new Cookies();
const ACCESS_TOKEN_KEY = "accessToken";

/** ?a=1&a=2 형태로 직렬화 (배열 쿼리 서버 호환) */
function serializeParams(params = {}) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (Array.isArray(v)) {
      v.forEach((vv) => {
        if (vv !== undefined && vv !== null) usp.append(k, String(vv));
      });
    } else {
      usp.append(k, String(v));
    }
  });
  return usp.toString();
}

const api = axios.create({
  // 두 환경 모두 지원: config.API_URL > VITE_API_BASE_URL > REACT_APP_API_URL
  baseURL:
    (config && config.API_URL) ||
    (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
    process.env.REACT_APP_API_URL ||
    "",
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: { serialize: serializeParams },
});

// 요청 인터셉터: 인증 토큰 자동 추가 (+ 특정 요청은 스킵 지원)
api.interceptors.request.use(
  (cfg) => {
    // ✅ 이 헤더가 있으면 Authorization을 절대 붙이지 않음 (익명 호출용)
    if (cfg.headers && cfg.headers["X-Skip-Auth"]) {
      // 서버로는 이 커스텀 헤더가 가지 않도록 여기서 제거
      delete cfg.headers["X-Skip-Auth"];
      return cfg;
    }

    const cookieToken = cookies.get(ACCESS_TOKEN_KEY);
    const lsToken =
      typeof window !== "undefined"
        ? window.localStorage.getItem(ACCESS_TOKEN_KEY)
        : null;
    const token = cookieToken || lsToken;
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
  },
  (error) => Promise.reject(error)
);

// 응답 Content-Type 간단 검증 (필요 시 조정)
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

// 표준 에러 메시지 추출
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

// 응답 인터셉터: 에러 처리 + CT 검증
api.interceptors.response.use(
  (response) => {
    try {
      validateContentType(response);
    } catch (e) {
      console.error(e?.message || e);
    }
    return response;
  },
  (error) => {
    // 어떤 경우든 friendlyMessage 붙여서 상위에서 공통 사용 가능
    error.friendlyMessage = extractFriendlyMessage(error);

    if (error.response) {
      switch (error.response.status) {
        case 401: {
          // 인증 실패 - 토큰 제거
          cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });
          try {
            localStorage.removeItem(ACCESS_TOKEN_KEY);
          } catch (_) {}
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

// --- 편의 헬퍼들: 항상 data만 반환 ---
export const get = async (url, params = {}, options = {}) => {
  const res = await api.get(url, { params, ...options });
  return res.data;
};

export const post = async (url, data, options = {}) => {
  const res = await api.post(url, data, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  return res.data;
};

export const put = async (url, data, options = {}) => {
  const res = await api.put(url, data, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  return res.data;
};

export const del = async (url, options = {}) => {
  const res = await api.delete(url, options);
  return res.data;
};

export const patch = async (url, data, options = {}) => {
  const res = await api.patch(url, data, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  return res.data;
};

export const postMultipart = async (url, formData, options = {}) => {
  // 헤더 비워두면 Axios가 boundary 자동 설정
  const res = await api.post(url, formData, { headers: {}, ...options });
  return res.data;
};

// ✅ 인증 헤더를 강제로 제거해서 GET (익명 엔드포인트용)
export const getNoAuth = async (url, params = {}, options = {}) => {
  const res = await api.get(url, {
    params,
    ...options,
    headers: { ...(options.headers || {}), "X-Skip-Auth": "1" },
  });
  return res.data;
};

export default api;
