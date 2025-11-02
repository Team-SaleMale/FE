import endpoints from "../endpoints";
import { get, post, patch } from "../client";

export const fetchProfile = () => get(endpoints.USERS.PROFILE);

export const setRegion       = (payload) => post(endpoints.USERS.SET_REGION, payload);          // { regionId }
export const changeRange     = (payload) => patch(endpoints.USERS.CHANGE_RANGE, payload);       // { rangeKm }
export const resetPassword   = (payload) => patch(endpoints.USERS.RESET_PASSWORD, payload);     // { currentPassword, newPassword }
export const changeNickname  = (payload) => patch(endpoints.USERS.CHANGE_NICKNAME, payload);    // { nickname }
export const nearbyRegionIds = (params={}) => get(endpoints.USERS.NEARBY_REGION_IDS, params);   // { lat, lng }
