import endpoints from "../endpoints";
import { get, post, patch, del } from "../client";

// 사용자용 검색
export const searchRegions = (q, page = 0, size = 10) =>
  get(endpoints.REGIONS.SEARCH, { q, page, size });

// 관리자용 CRUD
export const createRegion = (payload) => post(endpoints.REGIONS.CREATE, payload);
export const updateRegion = (regionId, payload) => patch(endpoints.REGIONS.UPDATE(regionId), payload);
export const deleteRegion = (regionId) => del(endpoints.REGIONS.DELETE(regionId));
