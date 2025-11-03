import apiClient from '../client';

/**
 * 사용자 관련 API
 */

export const userService = {
  /**
   * 내 프로필 조회
   * GET /users
   *
   * 현재 로그인한 사용자의 프로필 정보를 반환합니다. JWT 토큰이 필요합니다.
   *
   * @returns {Promise} 프로필 정보 { isSuccess, code, message, result: { id, nickname, email, mannerScore, rangeSetting, profileImage, alarmChecked, phoneNumber, phoneVerified } }
   */
  getProfile: () => {
    return apiClient.get('/users');
  },
};

export default userService;
