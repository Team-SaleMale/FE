// src/pages/HotDeal/service.js
// 근처 핫딜 상점 조회 (서버 붙기 전 더미)

const ASSETS = {
  bean1: new URL("../../assets/img/HotDeal/bean1.jpg", import.meta.url).href,
  bean2: new URL("../../assets/img/HotDeal/bean2.jpg", import.meta.url).href,
  cafe1: new URL("../../assets/img/HotDeal/cafe1.jpg", import.meta.url).href,
  cafe2: new URL("../../assets/img/HotDeal/cafe2.jpg", import.meta.url).href,
  cro1:  new URL("../../assets/img/HotDeal/croissant1.jpg", import.meta.url).href,
  cro2:  new URL("../../assets/img/HotDeal/croissant2.jpg", import.meta.url).href,
  flw1:  new URL("../../assets/img/HotDeal/flowers1.jpg", import.meta.url).href,
  flw2:  new URL("../../assets/img/HotDeal/flowers2.jpg", import.meta.url).href,
  pet1:  new URL("../../assets/img/HotDeal/CatTower.jpg", import.meta.url).href,
  pet2:  new URL("../../assets/img/HotDeal/PetShop1.jpg", import.meta.url).href,
  pet3:  new URL("../../assets/img/HotDeal/PetShop2.jpg", import.meta.url).href,
  sports1:  new URL("../../assets/img/HotDeal/basketBall.jpg", import.meta.url).href,
  sports2:  new URL("../../assets/img/HotDeal/SportsCenter.jpeg", import.meta.url).href,
  salon1:  new URL("../../assets/img/HotDeal/godegi.jpg", import.meta.url).href,
  salon2:  new URL("../../assets/img/HotDeal/salon.jpg", import.meta.url).href,
  salon3:  new URL("../../assets/img/HotDeal/salon2.jpg", import.meta.url).href,
  blender1:  new URL("../../assets/img/HotDeal/livingmarket.jpg", import.meta.url).href,
  juice1:  new URL("../../assets/img/HotDeal/juice.jpg", import.meta.url).href,
  juice2:  new URL("../../assets/img/HotDeal/juiceShop.jpg", import.meta.url).href,
  juice3:  new URL("../../assets/img/HotDeal/juiceShop2.jpg", import.meta.url).href,
  kids1:  new URL("../../assets/img/HotDeal/kidsClothShop.jpg", import.meta.url).href,
  kids2:  new URL("../../assets/img/HotDeal/kidsClothShop2.png", import.meta.url).href,
  kids3:  new URL("../../assets/img/HotDeal/babyCloth.jpg", import.meta.url).href,
  furniture1:  new URL("../../assets/img/HotDeal/handler.jpg", import.meta.url).href,
  furniture2:  new URL("../../assets/img/HotDeal/handler2.jpg", import.meta.url).href,
  furniture3:  new URL("../../assets/img/HotDeal/furnitureShop.jpg", import.meta.url).href,
  furniture4:  new URL("../../assets/img/HotDeal/furnitureShop2.jpg", import.meta.url).href,
  digital1:  new URL("../../assets/img/HotDeal/usb.jpg", import.meta.url).href,
  digital2:  new URL("../../assets/img/HotDeal/digitalShop.jpg", import.meta.url).href,
  digital3:  new URL("../../assets/img/HotDeal/digitalshop2.jpg", import.meta.url).href,
};

// 카테고리 표시용 라벨(필요 시 확장)
const KEY_TO_LABEL = {
  "food-processed": "가공식품",
  "plant": "식물/꽃",
  "living-kitchen": "리빙/주방",
  "digital": "디지털",
  "sports": "스포츠",
  "home-appliance": "가전",
  "health-food": "건강식",
  "beauty": "뷰티",
  "women-acc": "여성ACC",
  "furniture": "가구",
  "kids": "키즈",
  "clothes": "의류",
  "pet": "반려",
  "ticket": "티켓",
};

// 기준 시간 유틸
function fmt(d) {
  return d.toISOString().slice(0, 16).replace("T", " ");
}
function plusMin(base, m) {
  return fmt(new Date(base.getTime() + m * 60000));
}

// 좌표 근처로 살짝 흩뿌리기(약 ±300m)
function near([lat, lng], dx = 0, dy = 0) {
  // 1도 ≒ 111km, 경도는 위도 cos 보정
  const kmPerDegLat = 111;
  const kmPerDegLng = 111 * Math.cos((lat * Math.PI) / 180);
  return [
    lat + (dy / kmPerDegLat),
    lng + (dx / kmPerDegLng),
  ];
}

// 지정한 포인트들(주변에 생성)
const BASES = [
  [37.609242, 126.892390],
  [37.656772, 126.832411],
  [37.479154, 126.942804],
  [37.561497, 126.810610],
  [37.454934, 126.418629],
  [37.5667,   126.9784],     // 시청 주변도 한두개 유지
];

export async function fetchNearbyHotDeals({ lat, lng, radiusKm = 3 }) {
  const now = new Date();

  // 더미 목록
  const rows = [
    {
      id: 101,
      title: "오늘 구운 크루아상 10개",
      storeName: "빵굽는셰프",
      categoryKey: "food-processed",
      categoryLabel: KEY_TO_LABEL["food-processed"],
      coord: near(BASES[5], +0.2, +0.1),
      startsAt: plusMin(now, -30),
      endsAt: plusMin(now, 180),
      currentPrice: 7_200,
      startPrice: 4_500,
      views: 132,
      bidCount: 9,
      sellerDesc:
        "매일 아침 갓 구운 버터 크루아상입니다. 오늘자 생산분 A급 → 재고 과다로 핫딜 진행합니다. 매장 픽업만 가능, 포장 포함.",
      coverImg: ASSETS.cro1,
      images: [ASSETS.cro1, ASSETS.cro2, ASSETS.cafe1],
      url: "/auction/101",
    },
    {
      id: 102,
      title: "장미 꽃다발 B급(살짝 상처)",
      storeName: "동네꽃집",
      categoryKey: "plant",
      categoryLabel: KEY_TO_LABEL["plant"],
      coord: near(BASES[5], -0.25, +0.15),
      startsAt: plusMin(now, -10),
      endsAt: plusMin(now, 120),
      currentPrice: 13_500,
      startPrice: 12_000,
      views: 88,
      bidCount: 4,
      sellerDesc:
        "입고 중 일부 장미에 미세한 흠집이 있어 B급으로 판매합니다. 사진과 유사한 톤으로 구성됩니다. 당일 픽업.",
      coverImg: ASSETS.flw1,
      images: [ASSETS.flw1, ASSETS.flw2],
      url: "/auction/102",
    },
    {
      id: 103,
      title: "에스프레소 원두 1kg (유통임박)",
      storeName: "오늘의카페",
      categoryKey: "living-kitchen",
      categoryLabel: KEY_TO_LABEL["living-kitchen"],
      coord: near(BASES[5], +0.12, -0.18),
      startsAt: plusMin(now, -5),
      endsAt: plusMin(now, 60),
      currentPrice: 9_800,
      startPrice: 9_000,
      views: 64,
      bidCount: 3,
      sellerDesc:
        "다크 초콜릿 & 견과류 향의 블렌드. 유통기한 3주 남아 할인 진행합니다. 미개봉 새상품.",
      coverImg: ASSETS.bean1,
      images: [ASSETS.bean1, ASSETS.bean2, ASSETS.cafe2],
      url: "/auction/103",
    },

    // ── 요청한 다른 좌표 주변 데이터들 ─────────────────
    {
      id: 201,
      title: "반려묘 캣타워 중형",
      storeName: "햇살펫샵",
      categoryKey: "pet",
      categoryLabel: KEY_TO_LABEL["pet"],
      coord: near(BASES[0], +0.15, -0.1),
      startsAt: plusMin(now, -25),
      endsAt: plusMin(now, 240),
      currentPrice: 23_000,
      startPrice: 20_000,
      views: 77,
      bidCount: 5,
      sellerDesc:
        "전시품 사용감 거의 없는 상태. 부품/나사 모두 포함, 박스 포장 불가(현장 수령).",
      coverImg: ASSETS.pet1,
      images: [ASSETS.pet1, ASSETS.pet2,ASSETS.pet3],
      url: "/auction/201",
    },
    {
      id: 202,
      title: "스포츠 농구공 7호(연습용)",
      storeName: "코트옆체육사",
      categoryKey: "sports",
      categoryLabel: KEY_TO_LABEL["sports"],
      coord: near(BASES[1], -0.1, +0.12),
      startsAt: plusMin(now, -15),
      endsAt: plusMin(now, 90),
      currentPrice: 13_000,
      startPrice: 10_000,
      views: 41,
      bidCount: 2,
      sellerDesc:
        "동호회 연습용으로 쓰던 재고 정리. 공기 주입 후 바로 사용 가능. 미세한 스크래치 있음.",
      coverImg: ASSETS.sports1,
      images: [ASSETS.sports1, ASSETS.sports2],
      url: "/auction/202",
    },
    {
      id: 203,
      title: "미용 고데기 세트",
      storeName: "살롱클리어런스",
      categoryKey: "beauty",
      categoryLabel: KEY_TO_LABEL["beauty"],
      coord: near(BASES[1], +0.2, -0.05),
      startsAt: plusMin(now, -40),
      endsAt: plusMin(now, 200),
      currentPrice: 28_000,
      startPrice: 25_000,
      views: 52,
      bidCount: 3,
      sellerDesc:
        "시연용으로 2~3회 사용. 가열·온도 정상, 박스/설명서 포함. 교환/반품 불가.",
      coverImg: ASSETS.salon1,
      images: [ASSETS.salon1, ASSETS.salon2,ASSETS.salon3],
      url: "/auction/203",
    },
    {
      id: 204,
      title: "주방 핸드블렌더",
      storeName: "리빙마켓",
      categoryKey: "home-appliance",
      categoryLabel: KEY_TO_LABEL["home-appliance"],
      coord: near(BASES[2], +0.06, +0.06),
      startsAt: plusMin(now, -12),
      endsAt: plusMin(now, 110),
      currentPrice: 17_000,
      startPrice: 15_000,
      views: 33,
      bidCount: 1,
      sellerDesc:
        "선물받았는데 동일 제품 보유로 내놓아요. 미개봉 새상품, 1년 AS 가능(영수증 O).",
      coverImg: ASSETS.blender1,
      images: [ASSETS.blender1],
      url: "/auction/204",
    },
    {
      id: 205,
      title: "건강즙 80ml x 30포",
      storeName: "착즙공방",
      categoryKey: "health-food",
      categoryLabel: KEY_TO_LABEL["health-food"],
      coord: near(BASES[3], -0.08, -0.04),
      startsAt: plusMin(now, -5),
      endsAt: plusMin(now, 70),
      currentPrice: 19_500,
      startPrice: 18_000,
      views: 45,
      bidCount: 2,
      sellerDesc:
        "도라지배 원물 착즙. 냉장 보관 권장, 아이스팩 동봉. 당일 퀵/직접수령 가능.",
      coverImg: ASSETS.juice1,
      images: [ASSETS.juice1, ASSETS.juice2,ASSETS.juice3],
      url: "/auction/205",
    },
    {
      id: 206,
      title: "키즈 레인코트 S/M",
      storeName: "맘스웨어",
      categoryKey: "kids",
      categoryLabel: KEY_TO_LABEL["kids"],
      coord: near(BASES[3], +0.11, +0.09),
      startsAt: plusMin(now, -35),
      endsAt: plusMin(now, 190),
      currentPrice: 9_000,
      startPrice: 7_000,
      views: 22,
      bidCount: 1,
      sellerDesc:
        "사이즈 미스 반품분 정리. 노랑/민트 2컬러, 생활방수. 택부착 상태.",
      coverImg: ASSETS.kids1,
      images: [ASSETS.kids1, ASSETS.kids2,ASSETS.kids3],
      url: "/auction/206",
    },
    {
      id: 207,
      title: "중문 손잡이 세트(블랙)",
      storeName: "퍼니처랩",
      categoryKey: "furniture",
      categoryLabel: KEY_TO_LABEL["furniture"],
      coord: near(BASES[4], +0.2, +0.18),
      startsAt: plusMin(now, -20),
      endsAt: plusMin(now, 160),
      currentPrice: 12_000,
      startPrice: 10_000,
      views: 18,
      bidCount: 1,
      sellerDesc:
        "시공 취소 건으로 미사용 재고. 나사/브라켓 포함, 셀프교체 가능.",
      coverImg: ASSETS.furniture1,
      images: [ASSETS.furniture1, ASSETS.furniture2,ASSETS.furniture3,ASSETS.furniture4],
      url: "/auction/207",
    },
    {
      id: 208,
      title: "USB-C 멀티허브 6in1",
      storeName: "디지털창고",
      categoryKey: "digital",
      categoryLabel: KEY_TO_LABEL["digital"],
      coord: near(BASES[0], -0.12, +0.1),
      startsAt: plusMin(now, -8),
      endsAt: plusMin(now, 95),
      currentPrice: 21_000,
      startPrice: 19_000,
      views: 71,
      bidCount: 3,
      sellerDesc:
        "맥북/윈도우 공용. HDMI 4K, PD충전, SD/TF 지원. 테스터 개봉만 한 상태.",
      coverImg: ASSETS.digital1,
      images: [ASSETS.digital1, ASSETS.digital2,ASSETS.digital3,ASSETS.digital4,],
      url: "/auction/208",
    },
  ];

  // 좌표 주었을 때 필터는 지금은 생략(서버 붙을 때 반경 필터 적용)
  // 필요하면 아래처럼 거리를 계산해 radiusKm 내만 반환하면 됨.
  // return rows.filter(r => distance([lat,lng], r.coord) <= radiusKm)

  // 최종 포맷
  return rows.map((r) => ({
    ...r,
    lat: r.coord[0],
    lng: r.coord[1],
  }));
}
