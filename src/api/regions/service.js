import endpoints from "../endpoints";
import { get, post, patch, del } from "../client";

// 사용자용 검색
export const searchRegions = (q) => get(endpoints.REGIONS.SEARCH, { q });

// 관리자용 CRUD
export const createRegion = (payload) => post(endpoints.REGIONS.CREATE, payload);
export const updateRegion = (regionId, payload) => patch(endpoints.REGIONS.UPDATE(regionId), payload);
export const deleteRegion = (regionId) => del(endpoints.REGIONS.DELETE(regionId));
