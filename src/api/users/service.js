// src/api/users/service.js
// NOTE: 기존 주석/형식 유지 + develop 쪽 확장 API 병합

import endpoints from "../endpoints";
import api, { get, post, patch } from "../client";   // 통합 client: default axios 인스턴스 + 헬퍼들

/**
 * 사용자 관련 API
 */

/**
 * 내 프로필 조회
 * GET /users
 *
 * 현재 로그인한 사용자의 프로필 정보를 반환합니다. JWT 토큰이 필요합니다.
 *
 * @returns {Promise} 프로필 정보 { isSuccess, code, message, result: { id, nickname, email, mannerScore, rangeSetting, profileImage, alarmChecked, phoneNumber, phoneVerified } }
 */
export const getProfile = () => {
  // 과거 호환을 위해 axios 인스턴스 직접 사용
  return api.get(endpoints.USERS.PROFILE);
};

// --- develop 브랜치 확장 API 유지 ---
export const setRegion = ({ regionId, primary = true }) => {
  return api.post(endpoints.USERS.SET_REGION, null, { params: { regionId, primary } });
};
export const changeRange     = (payload) => patch(endpoints.USERS.CHANGE_RANGE, payload);     // { rangeKm }
export const resetPassword   = (payload) => patch(endpoints.USERS.RESET_PASSWORD, payload);   // { currentPassword, newPassword }
export const changeNickname  = (payload) => patch(endpoints.USERS.CHANGE_NICKNAME, payload);  // { nickname }
export const nearbyRegionIds = (params = {}) => get(endpoints.USERS.NEARBY_REGION_IDS, params); // { lat, lng }

// [ADD] UI 카테고리 키 → 서버 ENUM 매핑
const UI_TO_API_CATEGORY = {
  "home-appliance": "HOME_APPLIANCE",
  "health-food": "HEALTH_FOOD",
  "beauty": "BEAUTY",
  "food-processed": "FOOD_PROCESSED",
  "pet": "PET",
  "digital": "DIGITAL",
  "living-kitchen": "LIVING_KITCHEN",
  "women-acc": "WOMEN_ACC",
  "sports": "SPORTS",
  "plant": "PLANT",
  "game-hobby": "GAME_HOBBY",
  "ticket": "TICKET",
  "furniture": "FURNITURE",
  "book": "BOOK",
  "kids": "KIDS",
  "clothes": "CLOTHES",
  "etc": "ETC",
};

// [ADD] UI ID 배열을 서버 ENUM 배열로 변환
export function mapUiCatsToEnums(uiIds = []) {
  return (uiIds || [])
    .map((k) => UI_TO_API_CATEGORY[String(k).toLowerCase()] || null)
    .filter(Boolean);
}

// [ADD] 선호 카테고리 설정 (/mypage/auctions/category)
// 기존 선호 카테고리는 서버에서 모두 삭제 후 요청 본문으로 재설정
export async function saveUserCategories(uiIds = []) {
  const enums = mapUiCatsToEnums(uiIds);
  return post(endpoints.USERS.SET_CATEGORIES, { categories: enums });
}

// --- 과거 코드 호환 (feature 브랜치 스타일) ---
export const userService = {
  getProfile,
  // [ADD] 호환용 노출
  saveUserCategories,
  mapUiCatsToEnums,
};

export default userService;
