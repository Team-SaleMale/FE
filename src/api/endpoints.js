// src/api/endpoints.js
const endpoints = {
  AUTH: {
    REGISTER: "/auth/register",
    REFRESH:  "/auth/refresh",
    LOGIN:    "/auth/login",
    LOGOUT:   "/auth/logout",
    ME:       "/auth/me",
    ME_DELETE:"/auth/me",   
    CHECK_NICK:  "/auth/check/nickname",
    CHECK_EMAIL: "/auth/check/email", 
    EMAIL_VERIFY_REQUEST: "/auth/email/verify/request",   
    EMAIL_VERIFY_CONFIRM: "/auth/email/verify/confirm", 
    SOCIAL_COMPLETE: "/auth/social/complete", 
    OAUTH2_LOGIN: "/auth/oauth2/login",     
    PASSWORD_RESET_REQUEST: "/auth/password/reset",  
    PASSWORD_RESET_VERIFY:  "/auth/password/reset/verify", 
    PASSWORD_RESET_CONFIRM: "/auth/password/reset/confirm",
    OAUTH2_KAKAO: "/oauth2/authorization/kakao",
    OAUTH2_NAVER: "/oauth2/authorization/naver",
    OAUTH2_COMPLETE: "/auth/social/complete",
    REGION_SEARCH: "/search/regions",
  },

  USERS: {
    PROFILE: "/mypage",  // 내 프로필 조회
    SET_REGION: "/mypage/region",  // 활동 동네 설정
    CHANGE_RANGE: "/mypage/range-setting",  // 활동 반경 변경
    RESET_PASSWORD: "/mypage/password",  // 비밀번호 변경
    CHANGE_NICKNAME: "/mypage/nickname",  // 닉네임 변경
    NEARBY_REGION_IDS: "/mypage/regions/nearby",  // 근처 지역 ID 조회
  },

  REGIONS: {
    SEARCH: "/search/regions",
    CREATE: "/api/regions",
    UPDATE: (id) => `/api/regions/${id}`,
    DELETE: (id) => `/api/regions/${id}`,
  },

  AUCTIONS: {
    LIST: "/auctions",                       // ← 기본 목록
    REGISTER: "/auctions/registration",
    DETAIL:   (itemId) => `/auctions/${itemId}`,
    LIKE:     (itemId) => `/auctions/${itemId}/liked`,
    UNLIKE:   (itemId) => `/auctions/${itemId}/liked`,
    BID:      (itemId) => `/auctions/${itemId}/bid`,
    LIKED:    "/auctions/liked",
    UPLOAD_IMAGES: "/auctions/images",
    SUGGEST_TITLE: "/auctions/registration/suggest-title",
  },
  SEARCH: {
    ITEMS: "/search/items",   // 시세 둘러보기 검색용
  },
  CHAT: {
    CREATE_ROOM: (itemId) => `/items/${itemId}/chat`,  // 채팅방 생성
    LIST: "/chats",  // 채팅방 목록 조회
    ENTER: (chatId) => `/chats/${chatId}/enter`,  // 채팅방 입장
    EXIT: (chatId) => `/chats/${chatId}/exit`,  // 채팅방 나가기
  },
};

export default endpoints;
