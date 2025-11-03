// src/api/constants/mapping.js
// UI(key) → 서버 enum (카테고리)
export const CATEGORY_TO_ENUM = {
  "women-acc": "WOMEN_ACC",
  "food-processed": "FOOD_PROCESSED",
  sports: "SPORTS",
  plant: "PLANT",
  "game-hobby": "GAME_HOBBY",
  ticket: "TICKET",
  furniture: "FURNITURE",
  beauty: "BEAUTY",
  clothes: "CLOTHES",
  "health-food": "HEALTH_FOOD",
  pet: "PET",
  book: "BOOK",
  kids: "KIDS",
  digital: "DIGITAL",
  "living-kitchen": "LIVING_KITCHEN",
  "home-appliance": "HOME_APPLIANCE",
  etc: "ETC",
};

// UI(key) → 서버 enum (거래 방식)
export const TRADE_TO_ENUM = {
  shipping: "SHIPPING",
  direct: "IN_PERSON", // 직거래
  etc: "OTHER",
  // 방어적 한글 호환
  "택배": "SHIPPING",
  "직거래": "IN_PERSON",
  "기타": "OTHER",
};

// (선택) 헬퍼
export const toBackendCategory = (uiKey) => {
  const v = CATEGORY_TO_ENUM[uiKey];
  if (!v) throw new Error(`Unknown category key: ${uiKey}`);
  return v;
};
export const toBackendTradeMethods = (uiKeys = []) =>
  uiKeys.map((k) => {
    const v = TRADE_TO_ENUM[k];
    if (!v) throw new Error(`Unknown trade key: ${k}`);
    return v;
  });
