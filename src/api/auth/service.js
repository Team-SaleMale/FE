import endpoints from "../endpoints";
import { get, post, patch } from "../client";

export const register = (payload) => post(endpoints.AUTH.REGISTER, payload);
export const login    = (payload) => post(endpoints.AUTH.LOGIN, payload);
export const refresh  = (payload={}) => post(endpoints.AUTH.REFRESH, payload);
export const logout   = () => patch(endpoints.AUTH.LOGOUT, {});
export const me       = () => get(endpoints.AUTH.ME);

export const checkNickname = (nickname) =>
  get(endpoints.AUTH.CHECK_NICK, { value: nickname }).then((res) => {
    const r = res?.result || {};
    const available =
      (typeof r.isAvailable === "boolean" && r.isAvailable) ||
      (typeof r.available === "boolean" && r.available) ||
      Object.values(r).some((v) => v === true);
    return { available };
  });
export const checkEmail = (email) =>
  get(endpoints.AUTH.CHECK_EMAIL, { value: email }).then((res) => {
    // 서버 응답 예시:
    // { isSuccess: true, result: { isDuplicated: true } }
    const r = res?.result || {};
    const isDuplicated =
      (typeof r.isDuplicated === "boolean" && r.isDuplicated) ||
      (typeof r.duplicated === "boolean" && r.duplicated) ||
      (typeof r.exists === "boolean" && r.exists) ||
      (typeof r.isExists === "boolean" && r.isExists);

    // 중복이면 false, 아니면 true
    const available = !isDuplicated;

    // message 기반 예비 판정 (혹시 result가 비어있을 경우)
    if (!Object.keys(r).length && res?.message) {
      const msg = res.message.toLowerCase();
      if (msg.includes("중복") || msg.includes("이미")) return { available: false };
      if (msg.includes("가능")) return { available: true };
    }

    return { available };
  });


export const requestEmailCode = (email) => get(endpoints.AUTH.EMAIL_VERIFY_REQUEST, { email });
export const verifyEmailCode = (email, code) => post(endpoints.AUTH.EMAIL_VERIFY_CONFIRM, { email, code });