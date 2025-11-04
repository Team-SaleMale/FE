// src/api/endpoint.js
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
  },

  USERS: {
    PROFILE: "/api/users",
    SET_REGION: "/api/users/region",
    CHANGE_RANGE: "/api/users/range-setting",
    RESET_PASSWORD: "/api/users/password",
    CHANGE_NICKNAME: "/api/users/nickname",
    NEARBY_REGION_IDS: "/api/users/regions/nearby",
  },

  REGIONS: {
    SEARCH: "/api/search/regions",
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
};

export default endpoints;
