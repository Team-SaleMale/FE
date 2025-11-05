// src/api/client.js
import axios from "axios";
import { Cookies } from "react-cookie";
import config from "../config";

const cookies = new Cookies();
const ACCESS_TOKEN_KEY = "accessToken";

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

api.interceptors.request.use(
  (cfg) => {
    if (cfg.headers && cfg.headers["X-Skip-Auth"]) {
      cfg.withCredentials = false;
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
    error.friendlyMessage = extractFriendlyMessage(error);
    if (error.response) {
      switch (error.response.status) {
        case 401: {
          cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });
          try {
            localStorage.removeItem(ACCESS_TOKEN_KEY);
          } catch {}
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
  const res = await api.post(url, formData, { headers: {}, ...options });
  return res.data;
};

export const getNoAuth = async (url, params = {}, options = {}) => {
  const res = await api.get(url, {
    params,
    withCredentials: false,
    ...options,
    headers: { ...(options.headers || {}), "X-Skip-Auth": "1" },
  });
  return res.data;
};

export const postNoAuth = async (url, data = {}, options = {}) => {
  const res = await api.post(url, data, {
    withCredentials: false,
    headers: {
      ...(options.headers || {}),
      "Content-Type": "application/json",
      "X-Skip-Auth": "1",
    },
    ...options,
  });
  return res.data;
};

export default api;
