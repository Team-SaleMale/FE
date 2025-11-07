// src/api/auth/service.js
import endpoints from "../endpoints";
import { get, post, patch, postNoAuth } from "../client";
import { Cookies } from "react-cookie";

const cookies = new Cookies();
const ACCESS_TOKEN_KEY = "accessToken";

// 다양한 서버 응답 포맷에서 토큰을 최대한 안전하게 뽑아내기
function extractToken(res) {
  if (!res) return null;
  if (typeof res.accessToken === "string") return res.accessToken;
  if (typeof res.token === "string") return res.token;
  if (res.result) {
    if (typeof res.result.accessToken === "string") return res.result.accessToken;
    if (typeof res.result.token === "string") return res.result.token;
    if (typeof res.result.jwt === "string") return res.result.jwt;
    if (typeof res.result.access_token === "string") return res.result.access_token;
  }
  if (res.data) {
    if (typeof res.data.accessToken === "string") return res.data.accessToken;
    if (res.data.result && typeof res.data.result.accessToken === "string")
      return res.data.result.accessToken;
  }
  return null;
}

function saveToken(token) {
  try {
    cookies.set(ACCESS_TOKEN_KEY, token, { path: "/" });
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch {}
}

// refresh 응답에서 accessToken 안전 추출
function extractAccessTokenFromRefresh(res) {
  const data = res?.result ?? res?.data ?? res;
  return data?.accessToken || null;
}

function clearToken() {
  try {
    cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {}
}

export const register = (payload, verifyToken) =>
  postNoAuth(endpoints.AUTH.REGISTER, payload, {
    headers: { "X-Email-Verify-Token": verifyToken },
  });

// 중복 호출 가드 (선택)
let refreshing = false;

// ✅ 로그인: 서버가 (1) 응답 헤더 Authorization 또는 (2) 응답 바디 result.accessToken 중 하나로 토큰을 줄 수 있음
// NOTE(ChatGPT): client.js 응답 인터셉터가 Authorization 헤더를 자동 저장하므로, 여기서는 바디에 있으면 추가로 저장하는 ‘보강’만 수행.
export const login = async (payload) => {
  // 1) 로그인 (쿠키 수신 허용)
  const res = await postNoAuth(endpoints.AUTH.LOGIN, payload, {
    withCredentials: true,
    headers: { "X-Allow-Credentials": "1" },
  });

  // 2) 응답 바디에 accessToken이 있으면 즉시 저장 (헤더 경로가 없을 때 대비)
  try {
    const tokenFromBody = extractToken(res);
    if (tokenFromBody) {
      saveToken(tokenFromBody);
    }
  } catch {
    // no-op
  }

  // 3) 보수적 리프레시 시도: 토큰이 끝내 저장되지 않았을 때만 1회
  if (!cookies.get(ACCESS_TOKEN_KEY) && !localStorage.getItem(ACCESS_TOKEN_KEY) && !refreshing) {
    try {
      refreshing = true;
      const refreshRes = await post(
        endpoints.AUTH.REFRESH,
        {},
        {
          withCredentials: true,
          headers: { "X-Allow-Credentials": "1" },
        }
      );
      // 서버가 본문에 accessToken을 줄 수도 있고(스웨거 예시),
      // 헤더 Authorization으로 줄 수도 있으므로 client.js 인터셉터가 처리함.
      const maybe = extractAccessTokenFromRefresh(refreshRes);
      if (maybe) saveToken(maybe);
    } catch (e) {
      console.error("[login] optional refresh after login failed:", e);
    } finally {
      refreshing = false;
    }
  }

  return res;
};

export const refresh = (payload = {}) =>
  post(endpoints.AUTH.REFRESH, payload, {
    withCredentials: true,
    headers: { "X-Allow-Credentials": "1" },
  });

// ✅ 로그아웃: 서버 호출 성공/실패와 무관하게 로컬 토큰 정리
export const logout = async () => {
  try {
    await patch(endpoints.AUTH.LOGOUT, {}, { withCredentials: true });
  } finally {
    clearToken();
  }
};

export const me = () => get(endpoints.AUTH.ME);
export const myProfile = () => get(endpoints.USERS.PROFILE);

export const checkNickname = (nickname) =>
  get(endpoints.AUTH.CHECK_NICK, { value: String(nickname || "").trim() })
    .then((res) => {
      const raw = res?.result?.exists;
      const exists = raw === true || raw === "true" || raw === 1 || raw === "1";
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

// NOTE: 인증 없이 본문(JSON)으로 이메일 전송
export const requestEmailCode = (email) =>
  postNoAuth(endpoints.AUTH.EMAIL_VERIFY_REQUEST, { email });

export const verifyEmailCode = (email, code) =>
  postNoAuth(endpoints.AUTH.EMAIL_VERIFY_CONFIRM, { email, code });

export async function completeSocialSignup({ signupToken, nickname, regionId }) {
  const qs = new URLSearchParams({
    signupToken,
    nickname,
    regionId: String(regionId),
  }).toString();
  // 서버가 POST 쿼리수신을 기대하므로 유지
  return post(`${endpoints.AUTH.SOCIAL_COMPLETE}?${qs}`);
}
