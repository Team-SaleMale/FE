const endpoints = {
  AUTH: {
    REGISTER: "/auth/register",
    REFRESH:  "/auth/refresh",
    LOGIN:    "/auth/login",
    LOGOUT:   "/auth/logout",
    ME:       "/auth/me",
    CHECK_NICK:  "/auth/check/nickname",
    CHECK_EMAIL: "/auth/check/email",
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
    REGISTER: "/auctions/registration",
    // ✅ Swagger와 동일한 경로로 교정
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
