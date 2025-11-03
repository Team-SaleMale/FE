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
};

export default mypageService;
