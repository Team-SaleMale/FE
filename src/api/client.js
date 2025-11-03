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
  // 두 환경 모두 지원: config.API_URL 우선, 없으면 REACT_APP_API_URL 사용
  baseURL: (config && config.API_URL) || process.env.REACT_APP_API_URL || "",
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: { serialize: serializeParams },
});

// 요청 인터셉터: 인증 토큰 자동 추가
api.interceptors.request.use(
  (cfg) => {
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
  if (ct.includes("application/json") || ct.includes("text/")) return;
  if (
    ct.includes("multipart/") ||
    ct.includes("image/") ||
    ct.includes("octet-stream")
  )
    return;
  throw new Error("서버 응답이 올바르지 않습니다.");
};

// 응답 인터셉터: 에러 처리 + CT 검증
api.interceptors.response.use(
  (response) => {
    try {
      validateContentType(response);
    } catch (e) {
      console.error(e?.message || e);
      // 필요하면 여기서 사용자 알림/UI 처리
    }
    return response;
  },
  (error) => {
    if (error.response) {
      // 서버 응답이 있는 경우
      switch (error.response.status) {
        case 401: {
          // 인증 실패 - 토큰 제거 후 로그인 페이지로 리다이렉트
          cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });
          try {
            localStorage.removeItem(ACCESS_TOKEN_KEY);
          } catch (_) {}
          if (typeof window !== "undefined") window.location.href = "/login";
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
      // 요청은 보냈지만 응답이 없는 경우
      console.error("서버로부터 응답이 없습니다.");
    } else {
      // 요청 설정 중 에러가 발생한 경우
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

export default api;
