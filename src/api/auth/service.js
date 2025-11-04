import endpoints from "../endpoints";
import { get, post, patch } from "../client";

export const register = (payload) => post(endpoints.AUTH.REGISTER, payload);
export const login    = (payload) => post(endpoints.AUTH.LOGIN, payload);
export const refresh  = (payload={}) => post(endpoints.AUTH.REFRESH, payload);
export const logout   = () => patch(endpoints.AUTH.LOGOUT, {});
export const me       = () => get(endpoints.AUTH.ME);

export const checkNickname = (nickname) =>
  get(endpoints.AUTH.CHECK_NICK, { value: String(nickname || "").trim() })
    .then((res) => {
      const exists = Boolean(res?.result?.exists);
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


export const requestEmailCode = (email) => get(endpoints.AUTH.EMAIL_VERIFY_REQUEST, { email });
export const verifyEmailCode = (email, code) => post(endpoints.AUTH.EMAIL_VERIFY_CONFIRM, { email, code });

export const completeSocialSignup = (params) => get(endpoints.AUTH.OAUTH2_COMPLETE, params);