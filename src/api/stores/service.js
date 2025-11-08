// src/api/stores/service.js
// 가게(스토어) 메타 더미 API

// 📦 더미 데이터
const DUMMY_STORES = {
  me: {
    id: "S-1001",
    name: "오늘의카페",
    address: "서울특별시 중구 세종대로 110",
    lat: 37.5665,      // 서울시청 근처
    lng: 126.9780,
  },
  "S-2001": {
    id: "S-2001",
    name: "빵굽는셰프",
    address: "서울특별시 종로구 청계천로 41",
    lat: 37.5715,
    lng: 126.9770,
  },
  "S-3001": {
    id: "S-3001",
    name: "착즙공방",
    address: "서울특별시 성동구 아차산로 49",
    lat: 37.5445,
    lng: 127.0560,
  },
};

// ⏱️ 네트워크 지연 흉내
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

/** 로그인된 판매자의 가게 정보 */
export async function fetchMyStore() {
  await delay();
  return { ...DUMMY_STORES.me };
}

/** 특정 storeId로 가게 조회 (없으면 null) */
export async function fetchStoreById(storeId) {
  await delay(200);
  const row = DUMMY_STORES[storeId];
  return row ? { ...row } : null;
}
