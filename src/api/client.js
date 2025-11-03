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
  baseURL: config.API_URL,
  withCredentials: true,
  paramsSerializer: { serialize: serializeParams },
});

api.interceptors.request.use((cfg) => {
  const cookieToken = cookies.get(ACCESS_TOKEN_KEY);
  const lsToken =
    typeof window !== "undefined"
      ? window.localStorage.getItem(ACCESS_TOKEN_KEY)
      : null;
  const token = cookieToken || lsToken;
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

const validateContentType = (response) => {
  const ct = (response.headers?.["content-type"] || "").toLowerCase();
  const st = response.status;
  if (st === 204) return;
  if (ct.includes("application/json") || ct.includes("text/")) return;
  if (ct.includes("multipart/") || ct.includes("image/") || ct.includes("octet-stream")) return;
  throw new Error("서버 응답이 올바르지 않습니다.");
};

export const get = async (url, params = {}, options = {}) => {
  const res = await api.get(url, { params, ...options });
  validateContentType(res);
  return res.data;
};

export const post = async (url, data, options = {}) => {
  const res = await api.post(url, data, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  validateContentType(res);
  return res.data;
};

export const put = async (url, data, options = {}) => {
  const res = await api.put(url, data, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  validateContentType(res);
  return res.data;
};

export const del = async (url, options = {}) => {
  const res = await api.delete(url, options);
  validateContentType(res);
  return res.data;
};

export const patch = async (url, data, options = {}) => {
  const res = await api.patch(url, data, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  validateContentType(res);
  return res.data;
};

export const postMultipart = async (url, formData, options = {}) => {
  const res = await api.post(url, formData, { headers: {}, ...options });
  validateContentType(res);
  return res.data;
};

export default api;
