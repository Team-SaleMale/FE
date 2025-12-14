import apiClient from '../client';
import endpoints from '../endpoints';

/**
 * 채팅 관련 API
 */

export const chatService = {
  /**
   * 채팅방 생성
   * POST /items/{itemId}/chat
   *
   * 경매 낙찰 시 채팅방을 생성합니다.
   *
   * @param {number} itemId - 경매 상품 ID
   * @param {number} userId - 사용자 ID (헤더에 포함)
   * @returns {Promise} 채팅방 생성 응답 { chatId }
   */
  createChatRoom: (itemId, userId) => {
    return apiClient.post(endpoints.CHAT.CREATE_ROOM(itemId), null, {
      headers: {
        'user-id': String(userId)
      }
    });
  },

  /**
   * 채팅방 목록 조회
   * GET /chats
   *
   * 사용자의 채팅방 목록과 읽지 않은 메시지 개수를 조회합니다.
   *
   * @param {number} userId - 사용자 ID (헤더에 포함)
   * @param {Object} params - 쿼리 파라미터
   * @param {number} params.page - 페이지 번호 (기본값: 0)
   * @param {number} params.size - 페이지당 아이템 개수 (기본값: 50)
   * @returns {Promise} 채팅방 목록 [{ chatId, unreadCount }]
   */
  getChatList: (userId, params = { page: 0, size: 50 }) => {
    return apiClient.get(endpoints.CHAT.LIST, {
      params,
      headers: {
        'user-id': String(userId)
      }
    });
  },

  /**
   * 채팅방 입장
   * POST /chats/{chatId}/enter
   *
   * 해당 채팅방의 메시지들을 조회하고 읽지 않은 메시지를 모두 읽음 처리합니다.
   *
   * @param {number} chatId - 채팅방 ID
   * @param {number} userId - 사용자 ID (헤더에 포함)
   * @param {Object} params - 쿼리 파라미터
   * @param {number} params.page - 페이지 번호 (기본값: 0)
   * @param {number} params.size - 페이지당 아이템 개수 (기본값: 50)
   * @returns {Promise} 채팅방 입장 응답 { chatId, readerId, updatedCount, unreadCountAfter, messages[], canSend }
   */
  enterChatRoom: (chatId, userId, params = { page: 0, size: 50 }) => {
    return apiClient.post(endpoints.CHAT.ENTER(chatId), null, {
      params,
      headers: {
        'user-id': String(userId)
      }
    });
  },

  /**
   * 채팅방 나가기
   * PATCH /chats/{chatId}/exit
   *
   * 채팅방에서 나가며 나간 시간이 기록됩니다.
   *
   * @param {number} chatId - 채팅방 ID
   * @param {number} userId - 사용자 ID (헤더에 포함)
   * @returns {Promise} 채팅방 나가기 응답
   */
  exitChatRoom: (chatId, userId) => {
    return apiClient.patch(endpoints.CHAT.EXIT(chatId), null, {
      headers: {
        'user-id': String(userId)
      }
    });
  },

  /**
   * 메시지 보내기
   * POST /messages
   *
   * 채팅방으로 메시지를 보냅니다.
   *
   * @param {number} userId - 사용자 ID (헤더에 포함)
   * @param {Object} messageData - 메시지 데이터
   * @param {number} messageData.chatId - 채팅방 ID
   * @param {string} messageData.content - 메시지 내용
   * @param {string} messageData.type - 메시지 타입 (기본값: TEXT)
   * @returns {Promise} 메시지 전송 응답 { messageId, chatId, senderId, content, type, read, sentAt }
   */
  sendMessage: (userId, messageData) => {
    return apiClient.post(endpoints.CHAT.SEND_MESSAGE, messageData, {
      headers: {
        'user-id': String(userId)
      }
    });
  },

  /**
   * 이미지 메시지 전송
   * POST /messages/image
   *
   * 이미지를 업로드하고 메시지로 전송합니다.
   *
   * @param {number} userId - 사용자 ID (헤더에 포함)
   * @param {number} chatId - 채팅방 ID
   * @param {File} file - 이미지 파일
   * @returns {Promise} 메시지 전송 응답 { messageId, chatId, senderId, content, type, read, sentAt }
   */
  sendImage: (userId, chatId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.post('/messages/image', formData, {
      params: { chatId },
      headers: {
        'user-id': String(userId),
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  /**
   * 대화 상대 차단
   * POST /{chatId}/block
   *
   * 상대방을 차단하고 상대방이 경매 등록한 물품이 보이지 않게 됩니다.
   *
   * @param {number} chatId - 채팅방 ID
   * @param {number} userId - 사용자 ID (헤더에 포함)
   * @returns {Promise} 차단 응답 { isSuccess, code, message, result: { blockedUserId, blocked } }
   */
  blockUser: (chatId, userId) => {
    return apiClient.post(endpoints.CHAT.BLOCK(chatId), null, {
      headers: {
        'user-id': String(userId)
      }
    });
  },

  /**
   * 대화 상대 차단 해제
   * POST /{chatId}/unblock
   *
   * 상대방을 차단 해제합니다.
   *
   * @param {number} chatId - 채팅방 ID
   * @param {number} userId - 사용자 ID (헤더에 포함)
   * @returns {Promise} 차단 해제 응답 { isSuccess, code, message, result: { blockedUserId, blocked } }
   */
  unblockUser: (chatId, userId) => {
    return apiClient.post(endpoints.CHAT.UNBLOCK(chatId), null, {
      headers: {
        'user-id': String(userId)
      }
    });
  },

  /**
   * 대화 상대 차단 여부 조회
   * GET /chats/{chatId}/block
   *
   * 상대방과의 차단 여부를 조회합니다.
   *
   * @param {number} chatId - 채팅방 ID
   * @param {number} userId - 사용자 ID (헤더에 포함)
   * @returns {Promise} 차단 여부 응답 { isSuccess, code, message, result: { partnerBlockedMe, iblockedPartner } }
   */
  checkBlockStatus: (chatId, userId) => {
    return apiClient.get(endpoints.CHAT.CHECK_BLOCK(chatId), {
      headers: {
        'user-id': String(userId)
      }
    });
  },
};

export default chatService;
