// src/api/hotdeals/service.js

// 🔵 서버 통신 공용 클라이언트
import { get, post, postMultipart } from "../client";
import endpoints from "../endpoints";

// ------------------------------------------------------------------
// 🔵 로컬 더미 이미지 (기존 그대로)
// ------------------------------------------------------------------
const ASSETS = {
  bean1: new URL("../../assets/img/HotDeal/bean1.jpg", import.meta.url).href,
  bean2: new URL("../../assets/img/HotDeal/bean2.jpg", import.meta.url).href,
  cafe1: new URL("../../assets/img/HotDeal/cafe1.jpg", import.meta.url).href,
  cafe2: new URL("../../assets/img/HotDeal/cafe2.jpg", import.meta.url).href,
  cro1: new URL("../../assets/img/HotDeal/croissant1.jpg", import.meta.url).href,
  cro2: new URL("../../assets/img/HotDeal/croissant2.jpg", import.meta.url).href,
  flw1: new URL("../../assets/img/HotDeal/flowers1.jpg", import.meta.url).href,
  flw2: new URL("../../assets/img/HotDeal/flowers2.jpg", import.meta.url).href,
  juice1: new URL("../../assets/img/HotDeal/juice.jpg", import.meta.url).href,
  juice2: new URL("../../assets/img/HotDeal/juiceShop.jpg", import.meta.url).href,
  juice3: new URL("../../assets/img/HotDeal/juiceShop2.jpg", import.meta.url).href,
  cafeDeli1: new URL("../../assets/img/HotDeal/bean1.jpg", import.meta.url).href,
  cafeDeli2: new URL("../../assets/img/HotDeal/bean2.jpg", import.meta.url).href,
  baguette1: new URL("../../assets/img/HotDeal/baguette.jpg", import.meta.url).href,
  baguette2: new URL("../../assets/img/HotDeal/baguette2.jpg", import.meta.url).href,
  baguette3: new URL("../../assets/img/HotDeal/baguette3.jpg", import.meta.url).href,
  banchan1: new URL("../../assets/img/HotDeal/banchan1.jpg", import.meta.url).href,
  banchan2: new URL("../../assets/img/HotDeal/banchan2.jpg", import.meta.url).href,
  banchan3: new URL("../../assets/img/HotDeal/banchan3.jpg", import.meta.url).href,
  bap1: new URL("../../assets/img/HotDeal/bap.jpg", import.meta.url).href,
  bap2: new URL("../../assets/img/HotDeal/bap2.jpg", import.meta.url).href,
  bread1: new URL("../../assets/img/HotDeal/bread1.jpg", import.meta.url).href,
  bread2: new URL("../../assets/img/HotDeal/bread2.jpg", import.meta.url).href,
  bread3: new URL("../../assets/img/HotDeal/bread3.jpg", import.meta.url).href,
  chicken1: new URL("../../assets/img/HotDeal/chicken1.jpg", import.meta.url).href,
  chicken2: new URL("../../assets/img/HotDeal/chicken2.jpg", import.meta.url).href,
  chicken3: new URL("../../assets/img/HotDeal/chicken3.jpg", import.meta.url).href,
  chicken4: new URL("../../assets/img/HotDeal/chicken4.jpg", import.meta.url).href,
  fish1: new URL("../../assets/img/HotDeal/fish1.jpg", import.meta.url).href,
  fish2: new URL("../../assets/img/HotDeal/fish2.jpg", import.meta.url).href,
  fish3: new URL("../../assets/img/HotDeal/fish3.jpg", import.meta.url).href,
  fruitSalad1: new URL("../../assets/img/HotDeal/fruitSalad1.jpg", import.meta.url).href,
  fruitSalad2: new URL("../../assets/img/HotDeal/fruitSalad2.jpg", import.meta.url).href,
  fruitSalad3: new URL("../../assets/img/HotDeal/fruitSalad3.jpg", import.meta.url).href,
  japchae1: new URL("../../assets/img/HotDeal/japchae1.jpg", import.meta.url).href,
  japchae2: new URL("../../assets/img/HotDeal/japchae2.jpg", import.meta.url).href,
  lunchBox1: new URL("../../assets/img/HotDeal/lunchBox1.jpg", import.meta.url).href,
  lunchBox2: new URL("../../assets/img/HotDeal/lunchBox2.jpg", import.meta.url).href,
  orange1: new URL("../../assets/img/HotDeal/orange1.jpg", import.meta.url).href,
  orange2: new URL("../../assets/img/HotDeal/orange2.jpg", import.meta.url).href,
  pasta1: new URL("../../assets/img/HotDeal/pasta1.jpg", import.meta.url).href,
  pasta2: new URL("../../assets/img/HotDeal/pasta2.jpg", import.meta.url).href,
  pasta3: new URL("../../assets/img/HotDeal/pasta3.jpg", import.meta.url).href,
  potatoSalad1: new URL("../../assets/img/HotDeal/potatoSalad.jpg", import.meta.url).href,
  potatoSalad2: new URL("../../assets/img/HotDeal/potatoSalad2.jpg", import.meta.url).href,
  roastChicken1: new URL("../../assets/img/HotDeal/roastChicken1.jpg", import.meta.url).href,
  roastChicken2: new URL("../../assets/img/HotDeal/roastChicken2.jpg", import.meta.url).href,
  roastChicken3: new URL("../../assets/img/HotDeal/roastChicken3.jpg", import.meta.url).href,
  salad1: new URL("../../assets/img/HotDeal/salad1.jpg", import.meta.url).href,
  salad2: new URL("../../assets/img/HotDeal/salad2.jpg", import.meta.url).href,
  salmon1: new URL("../../assets/img/HotDeal/salmon1.jpg", import.meta.url).href,
  salmon2: new URL("../../assets/img/HotDeal/salmon2.jpg", import.meta.url).href,
  salmon3: new URL("../../assets/img/HotDeal/salmon3.jpg", import.meta.url).href,
  soup1: new URL("../../assets/img/HotDeal/soup1.jpg", import.meta.url).href,
  soup2: new URL("../../assets/img/HotDeal/soup2.jpg", import.meta.url).href,
  soup3: new URL("../../assets/img/HotDeal/soup3.jpg", import.meta.url).href,
  sushi1: new URL("../../assets/img/HotDeal/sushi1.jpg", import.meta.url).href,
  sushi2: new URL("../../assets/img/HotDeal/sushi2.jpg", import.meta.url).href,
  sushi3: new URL("../../assets/img/HotDeal/sushi3.jpg", import.meta.url).href,
  tomato1: new URL("../../assets/img/HotDeal/tomato1.jpg", import.meta.url).href,
  tomato2: new URL("../../assets/img/HotDeal/tomato2.jpg", import.meta.url).href,
  tomato3: new URL("../../assets/img/HotDeal/tomato3.jpg", import.meta.url).href,
  veg1: new URL("../../assets/img/HotDeal/veg1.jpg", import.meta.url).href,
  veg2: new URL("../../assets/img/HotDeal/veg2.jpg", import.meta.url).href,
  veg3: new URL("../../assets/img/HotDeal/veg3.jpg", import.meta.url).href,
};

function fmt(d) {
  return d.toISOString().slice(0, 16).replace("T", " ");
}
function plusMin(base, m) {
  return fmt(new Date(base.getTime() + m * 60000));
}

// 좌표 근처로 흩뿌리기(±거리 km)
function near([lat, lng], dx = 0, dy = 0) {
  const kmPerDegLat = 111;
  const kmPerDegLng = 111 * Math.cos((lat * Math.PI) / 180);
  return [lat + dy / kmPerDegLat, lng + dx / kmPerDegLng];
}

const BASES = [
  [37.609242, 126.89239],
  [37.656772, 126.832411],
  [37.479154, 126.942804],
  [37.561497, 126.81061],
  [37.454934, 126.418629],
  [37.5667, 126.9784], // 시청
];

// ------------------------------------------------------------------
// 🔵 API 공용: 내 가게/이미지 업로드/등록
// ------------------------------------------------------------------

// 내 핫딜 가게 정보 조회 (GET /hotdeals/my-store)
export async function fetchMyHotdealStore() {
  const data = await get(endpoints.HOTDEALS.MY_STORE);
  return data?.result || null;
}

// 핫딜/경매 공용 이미지 업로드 (POST /auctions/images)
export async function uploadHotdealImages(files = []) {
  if (!files || files.length === 0) return [];

  const fd = new FormData();
  files.forEach((file) => {
    if (file) fd.append("images", file);
  });

  const data = await postMultipart(endpoints.AUCTIONS.UPLOAD_IMAGES, fd);
  const result = data?.result ?? data;

  let urls = [];
  if (Array.isArray(result)) urls = result;
  else if (Array.isArray(result?.imageUrls)) urls = result.imageUrls;
  else if (typeof result === "string") urls = [result];
  else if (typeof result?.url === "string") urls = [result.url];
  else console.warn("[uploadHotdealImages] Unexpected response:", data);

  return urls;
}

// 핫딜 등록 (POST /hotdeals)
export async function registerHotdeal(payload) {
  const data = await post(endpoints.HOTDEALS.REGISTER, payload);
  return data;
}

// ------------------------------------------------------------------
// 🔵 더미 데이터 생성 함수
// ------------------------------------------------------------------
function buildDummyHotDeals() {
  const now = new Date();

  const rows = [
    {
      id: 1001,
      title: "모듬 샐러드팩(3팩) - 오늘 생산",
      storeName: "그린샐러드랩",
      coord: near(BASES[5], +0.16, +0.08),
      startsAt: plusMin(now, -40),
      endsAt: plusMin(now, 60),
      startPrice: 7500,
      currentPrice: 8000,
      views: 182,
      bidCount: 6,
      sellerDesc:
        "아침 세척·가공 신선 샐러드. 오늘만 특가, 냉장 보관 권장, 픽업 전용.",
      coverImg: ASSETS.salad1,
      images: [ASSETS.salad1, ASSETS.salad2],
      url: "/auction/1001",
    },
    {
      id: 1002,
      title: "오렌지 착즙 1L + 과일컵 2종",
      storeName: "비타쥬스바",
      coord: near(BASES[5], +0.1, -0.05),
      startsAt: plusMin(now, -25),
      endsAt: plusMin(now, 55),
      startPrice: 6500,
      currentPrice: 7200,
      views: 144,
      bidCount: 5,
      sellerDesc: "당일 착즙. 합성첨가물 無. 픽업 고객 컵얼음 무료.",
      coverImg: ASSETS.juice1,
      images: [ASSETS.juice1, ASSETS.juice2, ASSETS.juice3],
      url: "/auction/1002",
    },
    {
      id: 1003,
      title: "직화 연어덮밥(2) + 치킨마요(1) 세트",
      storeName: "오늘의덮밥",
      coord: near(BASES[5], -0.18, +0.12),
      startsAt: plusMin(now, -35),
      endsAt: plusMin(now, 70),
      startPrice: 8000,
      currentPrice: 9500,
      views: 120,
      bidCount: 4,
      sellerDesc: "점심 러시 이후 잔량 소진. 바로 픽업 권장(보온포장).",
      coverImg: ASSETS.bap1,
      images: [ASSETS.bap1, ASSETS.bap2],
      url: "/auction/1003",
    },
    {
      id: 1101,
      title: "아삭 로메인/케일 믹스 1kg(세척완료)",
      storeName: "채소마실",
      coord: near(BASES[0], +0.12, -0.1),
      startsAt: plusMin(now, -30),
      endsAt: plusMin(now, 80),
      startPrice: 5900,
      currentPrice: 6400,
      views: 88,
      bidCount: 3,
      sellerDesc:
        "저녁 샐러드용 대용량. 오늘 수확·세척. 소분 가능(현장요청).",
      coverImg: ASSETS.veg1,
      images: [ASSETS.veg1, ASSETS.veg2, ASSETS.veg3],
      url: "/auction/1101",
    },
    {
      id: 1102,
      title: "토마토 3kg(상처과 일부) 한정 특가",
      storeName: "과일창고 앞",
      coord: near(BASES[1], -0.06, +0.1),
      startsAt: plusMin(now, -20),
      endsAt: plusMin(now, 50),
      startPrice: 4900,
      currentPrice: 5600,
      views: 96,
      bidCount: 4,
      sellerDesc:
        "상처과 섞임으로 초특가. 소스/샐러드용 추천. 당일 소진.",
      coverImg: ASSETS.tomato1,
      images: [ASSETS.tomato1, ASSETS.tomato2, ASSETS.tomato3],
      url: "/auction/1102",
    },
    {
      id: 1103,
      title: "제철 생선 혼합(손질) 1.2kg",
      storeName: "바다직송수산",
      coord: near(BASES[1], +0.2, -0.04),
      startsAt: plusMin(now, -15),
      endsAt: plusMin(now, 65),
      startPrice: 9900,
      currentPrice: 12000,
      views: 131,
      bidCount: 6,
      sellerDesc:
        "입고분 잔량 손질 완료. 얼음포장 제공. 오늘 안에 수령 필수.",
      coverImg: ASSETS.fish1,
      images: [ASSETS.fish1, ASSETS.fish2, ASSETS.fish3],
      url: "/auction/1103",
    },
    {
      id: 1201,
      title: "갓구운 바게트 4개 묶음(오늘마감)",
      storeName: "빵굽는셰프",
      coord: near(BASES[2], +0.08, +0.06),
      startsAt: plusMin(now, -28),
      endsAt: plusMin(now, 45),
      startPrice: 3500,
      currentPrice: 4200,
      views: 172,
      bidCount: 8,
      sellerDesc:
        "오후 3시 굽고 잔량 소진. 식사용 대량 묶음. 포장 포함.",
      coverImg: ASSETS.baguette1,
      images: [ASSETS.baguette1, ASSETS.baguette2, ASSETS.baguette3],
      url: "/auction/1201",
    },
    {
      id: 1202,
      title: "천혜향 5kg 박스(맛은굿·외형B급)",
      storeName: "로컬과일상회",
      coord: near(BASES[2], -0.05, +0.09),
      startsAt: plusMin(now, -12),
      endsAt: plusMin(now, 75),
      startPrice: 9900,
      currentPrice: 11500,
      views: 102,
      bidCount: 5,
      sellerDesc:
        "표면 흠집/크기 불균일로 B급 처리. 맛 보장. 당일 소진.",
      coverImg: ASSETS.orange1,
      images: [ASSETS.orange1, ASSETS.orange2],
      url: "/auction/1202",
    },
    {
      id: 1301,
      title: "연어 자투리 800g(스테이크/덮밥용)",
      storeName: "연어한판",
      coord: near(BASES[3], -0.1, -0.04),
      startsAt: plusMin(now, -18),
      endsAt: plusMin(now, 50),
      startPrice: 6900,
      currentPrice: 8200,
      views: 139,
      bidCount: 7,
      sellerDesc: "손질 후 자투리 모음. 신선/냉장. 오늘만 이 가격!",
      coverImg: ASSETS.salmon1,
      images: [ASSETS.salmon1, ASSETS.salmon2, ASSETS.salmon3],
      url: "/auction/1301",
    },
    {
      id: 1302,
      title: "수제 과일샐러드컵 5개(혼합)",
      storeName: "프룻앤컵",
      coord: near(BASES[3], +0.11, +0.07),
      startsAt: plusMin(now, -30),
      endsAt: plusMin(now, 90),
      startPrice: 7000,
      currentPrice: 8500,
      views: 77,
      bidCount: 3,
      sellerDesc: "금일 컷팅. 보냉팩 권장. 픽업 시 시음 제공.",
      coverImg: ASSETS.fruitSalad1,
      images: [ASSETS.fruitSalad1, ASSETS.fruitSalad2, ASSETS.fruitSalad3],
      url: "/auction/1302",
    },
    {
      id: 1401,
      title: "버터롤/식빵 혼합팩(8개) - 굽자마자",
      storeName: "빵빵한하루",
      coord: near(BASES[4], +0.18, +0.16),
      startsAt: plusMin(now, -22),
      endsAt: plusMin(now, 60),
      startPrice: 3900,
      currentPrice: 4800,
      views: 98,
      bidCount: 4,
      sellerDesc:
        "막 구운 빵 잔량. 포장 포함, 리유저블백 지참 시 200원 할인.",
      coverImg: ASSETS.bread1,
      images: [ASSETS.bread1, ASSETS.bread2, ASSETS.bread3],
      url: "/auction/1401",
    },
    {
      id: 1402,
      title: "코울슬로/감자샐러드 벌크(카페 남품)",
      storeName: "델리마켓",
      coord: near(BASES[4], -0.12, +0.05),
      startsAt: plusMin(now, -10),
      endsAt: plusMin(now, 70),
      startPrice: 4500,
      currentPrice: 5200,
      views: 62,
      bidCount: 2,
      sellerDesc:
        "행사 잔량 대용량. 샌드 재료/파티 플래터용. 당일 소진 권장.",
      coverImg: ASSETS.potatoSalad1,
      images: [ASSETS.potatoSalad1, ASSETS.potatoSalad2, ASSETS.potatoSalad3],
      url: "/auction/1402",
    },
    {
      id: 1501,
      title: "반찬 4종 소분팩(시금치/콩나물/어묵/진미채)",
      storeName: "오늘반찬",
      coord: near(BASES[5], +0.05, +0.03),
      startsAt: plusMin(now, -25),
      endsAt: plusMin(now, 50),
      startPrice: 4500,
      currentPrice: 5200,
      views: 121,
      bidCount: 5,
      sellerDesc: "오늘 만든 기본 반찬 4종. 각 150g 소분, 냉장보관 권장.",
      coverImg: ASSETS.banchan1,
      images: [ASSETS.banchan1, ASSETS.banchan2, ASSETS.banchan3],
      url: "/auction/1501",
    },
    {
      id: 1502,
      title: "잡채 1kg (행사 잔량)",
      storeName: "동네반찬연구소",
      coord: near(BASES[0], +0.1, -0.06),
      startsAt: plusMin(now, -15),
      endsAt: plusMin(now, 45),
      startPrice: 5900,
      currentPrice: 6800,
      views: 86,
      bidCount: 3,
      sellerDesc: "막무침 잡채 대용량. 당일 제조, 포장 포함. 픽업만 가능.",
      coverImg: ASSETS.japchae1,
      images: [ASSETS.japchae1, ASSETS.japchae2],
      url: "/auction/1502",
    },
    {
      id: 1503,
      title: "국·찌개 1L (김치찌개/된장찌개 中 택1)",
      storeName: "엄마밥상",
      coord: near(BASES[2], -0.03, +0.04),
      startsAt: plusMin(now, -20),
      endsAt: plusMin(now, 60),
      startPrice: 4900,
      currentPrice: 5600,
      views: 99,
      bidCount: 4,
      sellerDesc:
        "저녁용 대용량 포장. 데우기만 하면 OK. 보온팩 옵션(+500원).",
      coverImg: ASSETS.soup1,
      images: [ASSETS.soup1, ASSETS.soup2, ASSETS.soup3],
      url: "/auction/1503",
    },
    {
      id: 1504,
      title: "닭강정 1.5kg (마감 특가)",
      storeName: "강정집",
      coord: near(BASES[1], +0.14, -0.02),
      startsAt: plusMin(now, -35),
      endsAt: plusMin(now, 55),
      startPrice: 6900,
      currentPrice: 8200,
      views: 141,
      bidCount: 6,
      sellerDesc:
        "행사 잔량. 재가열 권장(에어프라이어 180℃ 5~7분).",
      coverImg: ASSETS.chicken1,
      images: [ASSETS.chicken1, ASSETS.chicken2, ASSETS.chicken3, ASSETS.chicken4],
      url: "/auction/1504",
    },
    {
      id: 1601,
      title: "도시락 세트 잔량 3 (제육/치킨마요 혼합)",
      storeName: "회사앞식당",
      coord: near(BASES[3], +0.06, +0.02),
      startsAt: plusMin(now, -18),
      endsAt: plusMin(now, 40),
      startPrice: 7800,
      currentPrice: 9000,
      views: 117,
      bidCount: 5,
      sellerDesc:
        "점심 피크 이후 남은 도시락. 보온 보냉 포장, 빠른 픽업 권장.",
      coverImg: ASSETS.lunchBox1,
      images: [ASSETS.lunchBox1, ASSETS.lunchBox2],
      url: "/auction/1601",
    },
    {
      id: 1602,
      title: "초밥 모듬 반팩 (당일 한정)",
      storeName: "스시노코",
      coord: near(BASES[5], -0.07, +0.06),
      startsAt: plusMin(now, -12),
      endsAt: plusMin(now, 50),
      startPrice: 6900,
      currentPrice: 8400,
      views: 134,
      bidCount: 7,
      sellerDesc:
        "회전 잔량 모아 반팩 구성. 보냉팩 권장, 즉시 섭취 추천.",
      coverImg: ASSETS.sushi1,
      images: [ASSETS.sushi1, ASSETS.sushi2, ASSETS.sushi3],
      url: "/auction/1602",
    },
    {
      id: 1603,
      title: "파스타 소스 2종 + 생면 3인분",
      storeName: "이탈리안키친",
      coord: near(BASES[4], +0.09, -0.03),
      startsAt: plusMin(now, -22),
      endsAt: plusMin(now, 70),
      startPrice: 5900,
      currentPrice: 7200,
      views: 83,
      bidCount: 3,
      sellerDesc:
        "토마토·크림 소스 잔량 소분. 생면 동봉, 5분 조리.",
      coverImg: ASSETS.pasta1,
      images: [ASSETS.pasta1, ASSETS.pasta2, ASSETS.pasta3],
      url: "/auction/1603",
    },
    {
      id: 1604,
      title: "로스트치킨 윙/봉 1.2kg (재가열 권장)",
      storeName: "치킨앤그릴",
      coord: near(BASES[3], -0.05, +0.11),
      startsAt: plusMin(now, -28),
      endsAt: plusMin(now, 65),
      startPrice: 5900,
      currentPrice: 7600,
      views: 109,
      bidCount: 4,
      sellerDesc:
        "행사 후 잔량. 에어프라이어 180℃ 6분 재가열하면 바삭.",
      coverImg: ASSETS.roastChicken1,
      images: [ASSETS.roastChicken1, ASSETS.roastChicken2, ASSETS.roastChicken3],
      url: "/auction/1604",
    },
  ];

  return rows.map((r) => ({
    ...r,
    lat: r.coord[0],
    lng: r.coord[1],
  }));
}

// ------------------------------------------------------------------
// 🔵 /hotdeals API 응답 → 프론트 모델로 매핑
// ------------------------------------------------------------------
function mapApiItemToHotdeal(item) {
  const images = item.imageUrls || [];

  return {
    id: item.itemId,
    itemId: item.itemId,
    title: item.name,
    storeId: item.storeId,
    storeName: item.storeName,
    address: item.address,

    startPrice: item.startPrice,
    currentPrice: item.currentPrice,
    bidCount: item.bidderCount,

    // ✅ 경매 시작 시간: /hotdeals 응답의 createdAt 사용
    createdAt: item.createdAt,
    startsAt: item.createdAt,
    endsAt: item.endTime,
    itemStatus: item.itemStatus,

    coverImg: images[0] || null,
    images,

    // 문자열로 와도 숫자로 변환해서 사용
    lat: item.latitude != null ? Number(item.latitude) : null,
    lng: item.longitude != null ? Number(item.longitude) : null,

    url: `/auction/${item.itemId}`,
  };
}


// ------------------------------------------------------------------
// 🔵 근처 핫딜 리스트: 반경 필터 없이 "전체" + 더미 데이터
// ------------------------------------------------------------------
export async function fetchNearbyHotDeals({
  lat,        // 현재는 사용 안 함 (시그니처 유지용)
  lng,        // 현재는 사용 안 함
  radiusKm,   // 현재는 사용 안 함
  minPrice = 0,
  maxPrice = 0,
  sortType = "CREATED_DESC",
  page = 0,
  size = 20,
} = {}) {
  // 1) 더미 데이터
  const dummy = buildDummyHotDeals();

  // 2) API 데이터
  let apiItems = [];
  try {
    const data = await get(endpoints.HOTDEALS.LIST, {
      minPrice,
      maxPrice,
      sortType,
      page,
      size,
    });

    const items = data?.result?.items ?? [];
    apiItems = items.map(mapApiItemToHotdeal);
  } catch (e) {
    console.error("[fetchNearbyHotDeals] /hotdeals 조회 실패 → 더미만 사용:", e);
  }

  // 3) 필터 없이 그냥 합치기
  const merged = [...dummy, ...apiItems];

  if (process.env.NODE_ENV !== "production") {
    console.log(
      "[fetchNearbyHotDeals] dummy:",
      dummy.length,
      "api:",
      apiItems.length,
      "merged:",
      merged.length
    );
  }

  return merged;
}
