import endpoints from "../endpoints";
import { get, post, patch } from "../client";

export const register = (payload) => post(endpoints.AUTH.REGISTER, payload);
export const login    = (payload) => post(endpoints.AUTH.LOGIN, payload);
export const refresh  = (payload={}) => post(endpoints.AUTH.REFRESH, payload);
export const logout   = () => patch(endpoints.AUTH.LOGOUT, {});
export const me       = () => get(endpoints.AUTH.ME);

export const checkNickname = (nickname) => get(endpoints.AUTH.CHECK_NICK, { nickname });
export const checkEmail    = (email)    => get(endpoints.AUTH.CHECK_EMAIL, { email });
