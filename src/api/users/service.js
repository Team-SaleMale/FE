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

/**
 * 프로필 이미지 변경
 * PATCH /mypage/profile-image
 *
 * @param {File} file - 업로드할 이미지 파일 (50MB 이하, jpg/jpeg/png/gif/webp)
 * @returns {Promise} 업데이트된 프로필 정보
 */
export const changeProfileImage = (file) => {
  const formData = new FormData();
  formData.append('userProfile', file);

  return api.patch(endpoints.USERS.PROFILE_IMAGE, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// --- 과거 코드 호환 (feature 브랜치 스타일) ---
export const userService = {
  getProfile,
};

export default userService;
