import apiClient from '../client';

/**
 * 마이페이지 관련 API
 */

export const mypageService = {
  /**
   * 내 경매 목록 조회
   * GET /mypage/auctions
   *
   * 마이페이지에서 내가 판매/입찰/낙찰/유찰한 경매 상품 목록을 조회합니다.
   *
   * @param {Object} params - 쿼리 파라미터
   * @param {string} params.type - 경매 타입 (ALL, SELLING, BIDDING, WON, FAILED)
   * @param {string} params.sort - 정렬 기준 (CREATED_DESC, PRICE_DESC, PRICE_ASC)
   * @param {number} params.page - 페이지 번호 (0부터 시작)
   * @param {number} params.size - 페이지당 아이템 개수 (기본값: 20)
   * @returns {Promise} 경매 목록 응답 { isSuccess, code, message, result: { items, summary } }
   */
  getMyAuctions: (params = { type: 'ALL', sort: 'CREATED_DESC', page: 0, size: 20 }) => {
    return apiClient.get('/mypage/auctions', { params });
  },

  /**
   * 찜한 상품 목록 조회
   * GET /mypage/auctions/liked
   *
   * 현재 로그인한 사용자가 찜한 경매 상품 목록을 조회합니다. 최근 찜한 순으로 정렬됩니다.
   *
   * @param {Object} params - 쿼리 파라미터
   * @param {number} params.page - 페이지 번호 (0부터 시작, 기본값: 0)
   * @param {number} params.size - 페이지당 아이템 개수 (기본값: 20)
   * @returns {Promise} 찜한 상품 목록 응답 { isSuccess, code, message, result: { likedItems, totalElements, totalPages, currentPage, size, hasNext, hasPrevious } }
   */
  getLikedAuctions: (params = { page: 0, size: 20 }) => {
    return apiClient.get('/mypage/auctions/liked', { params });
  },

  /**
   * 선호 카테고리 조회
   * GET /mypage/auctions/category
   *
   * 사용자가 설정한 선호 카테고리 목록을 조회합니다.
   *
   * @returns {Promise} 선호 카테고리 응답 { isSuccess, code, message, result: { categories, count } }
   */
  getPreferredCategories: () => {
    return apiClient.get('/mypage/auctions/category');
  },

  /**
   * 선호 카테고리 설정
   * POST /mypage/auctions/category
   *
   * 사용자의 선호 카테고리를 설정합니다. 기존 설정은 모두 삭제되고 새로운 카테고리로 대체됩니다.
   *
   * @param {Object} data - 카테고리 설정 데이터
   * @param {Array<string>} data.categories - 카테고리 목록 (예: ["SPORTS", "PLANT", "TICKET"])
   * @returns {Promise} 선호 카테고리 설정 응답 { isSuccess, code, message, result: { categories, count } }
   */
  setPreferredCategories: (categories) => {
    return apiClient.post('/mypage/auctions/category', { categories });
  },

  /**
   * 받은 후기 조회
   * GET /mypage/auctions/reviews
   *
   * 마이페이지에서 다른 사용자들이 나에게 작성한 거래 후기 목록을 조회합니다.
   *
   * @param {Object} params - 쿼리 파라미터
   * @param {number} params.page - 페이지 번호 (0부터 시작, 기본값: 0)
   * @param {number} params.size - 페이지당 아이템 개수 (기본값: 20)
   * @returns {Promise} 받은 후기 목록 응답 { isSuccess, code, message, result: { reviews, totalElements, totalPages, currentPage, size, hasNext, hasPrevious } }
   */
  getReceivedReviews: (params = { page: 0, size: 20 }) => {
    return apiClient.get('/mypage/auctions/reviews', { params });
  },

  /**
   * 거래 후기 작성
   * POST /auctions/{itemId}/reviews
   *
   * 경매가 성공적으로 완료된 상품에 대해 거래 상대방에게 후기를 작성합니다.
   *
   * @param {number} itemId - 상품 ID
   * @param {Object} data - 후기 데이터
   * @param {string} data.rating - 별점 (ONE, TWO, THREE, FOUR, FIVE)
   * @param {string} data.content - 후기 내용
   * @returns {Promise} 후기 작성 응답 { isSuccess, code, message, result: { reviewId, itemId, itemTitle, targetUserId, targetNickname, rating, content, createdAt, updatedMannerScore } }
   */
  createReview: (itemId, data) => {
    return apiClient.post(`/auctions/${itemId}/reviews`, data);
  },
};

export default mypageService;
