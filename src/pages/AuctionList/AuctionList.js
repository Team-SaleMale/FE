// src/pages/AuctionList/AuctionList.js
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "../../styles/AuctionList/AuctionList.module.css";

import Toolbar from "./Toolbar";
import FilterSidebar from "./FilterSidebar";
import Horizontal from "./Horizontal";
import Vertical from "./Vertical";
import Pagination from "./Pagination";

/* =========================
   이미지 (기존 AuctionList)
   ========================= */
import ipad01 from "../../assets/img/AuctionList/ipad-01.png";
import ipad02 from "../../assets/img/AuctionList/ipad-02.png";
import ipad03 from "../../assets/img/AuctionList/ipad-03.png";
import ipad04 from "../../assets/img/AuctionList/ipad-04.png";
import ipad05 from "../../assets/img/AuctionList/ipad-05.png";

import nike01 from "../../assets/img/AuctionList/nike-01.png";
import nike02 from "../../assets/img/AuctionList/nike-02.png";
import nike03 from "../../assets/img/AuctionList/nike-03.png";

import chanel01 from "../../assets/img/AuctionList/chanel-01.png";
import chanel02 from "../../assets/img/AuctionList/chanel-02.png";
import chanel03 from "../../assets/img/AuctionList/chanel-03.png";

import zfold01 from "../../assets/img/AuctionList/zfold-01.png";
import zfold02 from "../../assets/img/AuctionList/zfold-02.png";
import zfold03 from "../../assets/img/AuctionList/zfold-03.png";

import watch01 from "../../assets/img/AuctionList/watch-01.png";
import watch02 from "../../assets/img/AuctionList/watch-02.png";
import watch03 from "../../assets/img/AuctionList/watch-03.png";

import dyson01 from "../../assets/img/AuctionList/dyson-01.png";
import dyson02 from "../../assets/img/AuctionList/dyson-02.png";
import dyson03 from "../../assets/img/AuctionList/dyson-03.png";

/* =========================
   (추가) CategoryPopular 기반 이미지
   ========================= */
import ha01 from "../../assets/img/Main/CategoryPopular/ha-01.png";
import ha02 from "../../assets/img/Main/CategoryPopular/ha-02.png";
import ha03 from "../../assets/img/Main/CategoryPopular/ha-03.png";
import ha04 from "../../assets/img/Main/CategoryPopular/ha-04.png";
import ha05 from "../../assets/img/Main/CategoryPopular/ha-05.png";
import ha06 from "../../assets/img/Main/CategoryPopular/ha-06.png";

import hf01 from "../../assets/img/Main/CategoryPopular/hf-01.png";
import hf02 from "../../assets/img/Main/CategoryPopular/hf-02.png";
import hf03 from "../../assets/img/Main/CategoryPopular/hf-03.png";
import hf04 from "../../assets/img/Main/CategoryPopular/hf-04.png";
import hf05 from "../../assets/img/Main/CategoryPopular/hf-05.png";
import hf06 from "../../assets/img/Main/CategoryPopular/hf-06.png";

import bt01 from "../../assets/img/Main/CategoryPopular/bt-01.png";
import bt02 from "../../assets/img/Main/CategoryPopular/bt-02.png";
import bt03 from "../../assets/img/Main/CategoryPopular/bt-03.png";
import bt04 from "../../assets/img/Main/CategoryPopular/bt-04.png";
import bt05 from "../../assets/img/Main/CategoryPopular/bt-05.png";
import bt06 from "../../assets/img/Main/CategoryPopular/bt-06.png";

/* =========================
   카테고리
   ========================= */
export const CATEGORIES = [
  { key: "home-appliance", label: "생활가전", icon: "solar:washing-machine-minimalistic-linear" },
  { key: "health-food", label: "건강기능식품", icon: "solar:dumbbell-large-minimalistic-linear" },
  { key: "beauty", label: "뷰티/미용", icon: "solar:magic-stick-3-linear" },
  { key: "food-processed", label: "가공식품", icon: "solar:chef-hat-linear" },
  { key: "pet", label: "반려동물", icon: "solar:cat-linear" },
  { key: "digital", label: "디지털 기기", icon: "solar:laptop-minimalistic-linear" },
  { key: "living-kitchen", label: "생활/주방", icon: "solar:whisk-linear" },
  { key: "women-acc", label: "여성잡화", icon: "solar:bag-smile-outline" },
  { key: "sports", label: "스포츠/레저", icon: "solar:balls-linear" },
  { key: "plant", label: "식물", icon: "solar:waterdrop-linear" },
  { key: "game-hobby", label: "게임/취미/음반", icon: "solar:reel-2-broken" },
  { key: "ticket", label: "티켓", icon: "solar:ticket-sale-linear" },
  { key: "furniture", label: "가구/인테리어", icon: "solar:armchair-2-linear" },
  { key: "book", label: "도서", icon: "solar:notebook-broken" },
  { key: "kids", label: "유아동", icon: "solar:smile-circle-linear" },
  { key: "clothes", label: "의류", icon: "solar:hanger-broken" },
  { key: "etc", label: "기타", icon: "solar:add-square-broken" },
];

/* =========================
   유틸 (KST 기준)
   ========================= */
const to2 = (n) => String(n).padStart(2, "0");
const timeLeftFrom = (endAtISO, nowMs) => {
  const diff = new Date(endAtISO).getTime() - nowMs;
  if (diff <= 0) return "0일 00:00:00";
  const sec = Math.floor(diff / 1000);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${d}일 ${to2(h)}:${to2(m)}:${to2(s)}`;
};
const ymdTZ = (dateLike, timeZone = "Asia/Seoul") => {
  const d = typeof dateLike === "string" ? new Date(dateLike) : dateLike;
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
  });
  return fmt.format(d).replaceAll("-", "/");
};
const isEndingTodayKST = (endAtISO, nowMs) =>
  ymdTZ(new Date(nowMs), "Asia/Seoul") === ymdTZ(endAtISO, "Asia/Seoul");
const isClosed = (endAtISO, nowMs) => new Date(endAtISO).getTime() <= nowMs;

// YYYY-MM-DD → KST 타임스탬프(날짜 시작/끝)
const kstMsFromYMD = (ymd, endOfDay = false) => {
  if (!ymd) return null;
  const hhmmss = endOfDay ? "23:59:59" : "00:00:00";
  return new Date(`${ymd}T${hhmmss}+09:00`).getTime();
};

// ✅ 제목 검색 정규화
const normalize = (s) => (s ?? "").toString().toLowerCase().replace(/\s+/g, "");

/* =========================
   API 형식 더미 데이터 생성
   ========================= */
const HOUR = 3600 * 1000;
const NOW0 = Date.now();
const isoFromNow = (ms) => new Date(NOW0 + ms).toISOString();

const TODAY_KST_YMD = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit",
}).format(new Date());
const KST_HMS = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
}).format(new Date()).split(":");
const NOW_KST_HOUR = Number(KST_HMS[0]);
const kstIsoAt = (h, m = 0, s = 0) =>
  `${TODAY_KST_YMD}T${to2(h)}:${to2(m)}:${to2(s)}+09:00`;

const IMG = {
  ipad: [ipad01, ipad02, ipad03, ipad04, ipad05],
  nike: [nike01, nike02, nike03],
  chanel: [chanel01, chanel02, chanel03],
  zfold: [zfold01, zfold02, zfold03],
  watch: [watch01, watch02, watch03],
  dyson: [dyson01, dyson02, dyson03],
};

let seq = 500;

// API 스키마 아이템 생성자
const mkApi = ({
  title, category_key, image_urls, startH, endH,
  start_price, bids = [], view_count, bidder_count, recommended = false,
}) => {
  const start_at = isoFromNow(startH * HOUR);
  const end_at = isoFromNow(endH * HOUR);
  const current_price = Math.max(start_price, ...(bids ?? []));
  const status = isClosed(end_at, Date.now()) ? "done" : "ongoing";
  return {
    id: seq++,
    title,
    category_key,
    image_urls,
    start_price,
    current_price,
    bid_count: Array.isArray(bids) ? bids.length : 0,
    bidder_count: bidder_count ?? Math.max(0, (Array.isArray(bids) ? bids.length : 0) - 1),
    view_count,
    recommended,
    start_at,
    end_at,
    status,
    seller_location: { label: "경기 고양시 덕양구" },
    distance_km: 8.2,
  };
};

const mkApiAbs = ({
  title, category_key, image_urls, start_at, end_at,
  start_price, bids = [], view_count, bidder_count, recommended = false,
}) => {
  const current_price = Math.max(start_price, ...(bids ?? []));
  const status = isClosed(end_at, Date.now()) ? "done" : "ongoing";
  return {
    id: seq++,
    title,
    category_key,
    image_urls,
    start_price,
    current_price,
    bid_count: Array.isArray(bids) ? bids.length : 0,
    bidder_count: bidder_count ?? Math.max(0, (Array.isArray(bids) ? bids.length : 0) - 1),
    view_count,
    recommended,
    start_at,
    end_at,
    status,
    seller_location: { label: "경기 고양시 덕양구" },
    distance_km: 8.2,
  };
};

/* ===== 기존 원본: API 스키마로 재작성 ===== */
const TODAY_ENDING_API = [
  mkApiAbs({
    title: "아이패드 프로 12.9 256GB – 오늘마감 A0",
    category_key: "digital",
    image_urls: IMG.ipad,
    start_at: kstIsoAt(Math.max(0, NOW_KST_HOUR - 5), 0, 0),
    end_at:   kstIsoAt(Math.min(23, NOW_KST_HOUR + 2), 30, 0),
    start_price: 999_000,
    bids: [1_120_000, 1_260_000],
    view_count: 2100,
    bidder_count: 320,
    recommended: true,
  }),
  mkApiAbs({
    title: "나이키 덩크 로우 260 – 오늘마감 N0",
    category_key: "clothes",
    image_urls: IMG.nike,
    start_at: kstIsoAt(Math.max(0, NOW_KST_HOUR - 8), 0, 0),
    end_at:   kstIsoAt(Math.min(23, NOW_KST_HOUR + 4), 0, 0),
    start_price: 205_000,
    bids: [228_000, 252_000, 265_000],
    view_count: 1540,
    bidder_count: 210,
  }),
  mkApiAbs({
    title: "샤넬 클래식 미듐 블랙 – 오늘마감 C0",
    category_key: "women-acc",
    image_urls: IMG.chanel,
    start_at: kstIsoAt(Math.max(0, NOW_KST_HOUR - 12), 0, 0),
    end_at:   kstIsoAt(Math.min(23, NOW_KST_HOUR + 1), 45, 0),
    start_price: 3_100_000,
    bids: [3_220_000, 3_380_000, 3_520_000],
    view_count: 2980,
    bidder_count: 150,
    recommended: true,
  }),
];

const ONGOING_API = [
  mkApi({ title:"아이패드 프로 12.9 256GB – 경매 A1", category_key:"digital", image_urls:IMG.ipad,  startH:-120, endH: 72,  start_price: 990_000, bids:[1_120_000,1_250_000], view_count:1810, bidder_count:312, recommended:true }),
  mkApi({ title:"갤럭시 Z Fold 6 512GB – 경매 Z1",     category_key:"digital", image_urls:IMG.zfold, startH:-36,  endH: 48,  start_price: 1_780_000, bids:[1_830_000,1_960_000,2_080_000], view_count:1325, bidder_count:188 }),
  mkApi({ title:"샤넬 클래식 미듐 블랙 – 경매 C1",      category_key:"women-acc", image_urls:IMG.chanel, startH:-72, endH: 96,  start_price: 3_050_000, bids:[3_150_000,3_320_000,3_470_000], view_count:2510, bidder_count:146, recommended:true }),
  mkApi({ title:"나이키 덩크 로우 260 – 경매 N1",        category_key:"clothes", image_urls:IMG.nike,  startH:-10,  endH: 36,  start_price: 210_000, bids:[232_000,248_000,261_000], view_count:1040, bidder_count:224 }),
  mkApi({ title:"다이슨 V15 Detect – 경매 D1",          category_key:"home-appliance", image_urls:IMG.dyson, startH:-30, endH: 60, start_price: 790_000, bids:[820_000, 880_000], view_count:1120, bidder_count:170 }),
  mkApi({ title:"애플 워치 울트라2 티타늄 – 경매 W1",    category_key:"digital", image_urls:IMG.watch, startH:-18, endH: 30, start_price: 920_000, bids:[950_000,1_010_000,1_060_000], view_count:1420, bidder_count:241, recommended:true }),
  mkApi({ title:"아이패드 프로 12.9 256GB – 경매 A2",    category_key:"digital", image_urls:IMG.ipad,  startH:-48, endH: 84, start_price: 1_020_000, bids:[1_120_000,1_280_000], view_count:990, bidder_count:205 }),
  mkApi({ title:"갤럭시 Z Fold 6 256GB – 경매 Z2",       category_key:"digital", image_urls:IMG.zfold, startH:-60, endH: 54, start_price: 1_650_000, bids:[1_730_000,1_880_000], view_count:1180, bidder_count:178, recommended:true }),
  mkApi({ title:"샤넬 클래식 라지 블랙 – 경매 C2",       category_key:"women-acc", image_urls:IMG.chanel, startH:-96, endH: 120, start_price: 3_200_000, bids:[3_260_000,3_420_000,3_560_000], view_count:2260, bidder_count:139 }),
  mkApi({ title:"나이키 덩크 로우 265 – 경매 N2",        category_key:"clothes", image_urls:IMG.nike,  startH:-12, endH: 28, start_price: 215_000, bids:[228_000,255_000,272_000], view_count:890, bidder_count:199, recommended:true }),
  mkApi({ title:"애플 워치 울트라2 오션밴드 – 경매 W2",  category_key:"digital", image_urls:IMG.watch, startH:-40, endH: 40, start_price: 930_000, bids:[960_000,1_020_000], view_count:1370, bidder_count:236 }),
  mkApi({ title:"다이슨 V15 무선청소기 – 경매 D2",       category_key:"home-appliance", image_urls:IMG.dyson, startH:-24, endH: 44, start_price: 800_000, bids:[830_000, 900_000], view_count:1080, bidder_count:165, recommended:true }),
];

const DONE_API = [
  mkApi({ title:"아이패드 프로 12.9 256GB – 경매 A3",    category_key:"digital", image_urls:IMG.ipad,  startH:-160, endH:-20, start_price: 990_000, bids:[1_050_000,1_140_000], view_count:1210, bidder_count:190, recommended:true }),
  mkApi({ title:"갤럭시 Z Fold 6 512GB – 경매 Z3",       category_key:"digital", image_urls:IMG.zfold, startH:-140, endH:-8,  start_price: 1_780_000, bids:[1_820_000,1_940_000], view_count:1290, bidder_count:176 }),
  mkApi({ title:"샤넬 클래식 미듐 블랙 – 경매 C3",       category_key:"women-acc", image_urls:IMG.chanel, startH:-200, endH:-12, start_price: 3_000_000, bids:[3_120_000,3_280_000,3_420_000], view_count:2380, bidder_count:140 }),
  mkApi({ title:"나이키 덩크 로우 260 – 경매 N3",        category_key:"clothes", image_urls:IMG.nike,  startH:-80,  endH:-2,  start_price: 205_000, bids:[230_000,244_000,258_000], view_count:960, bidder_count:210, recommended:true }),
  mkApi({ title:"다이슨 V15 Detect – 경매 D3",          category_key:"home-appliance", image_urls:IMG.dyson, startH:-120, endH:-30, start_price: 780_000, bids:[820_000, 870_000], view_count:1000, bidder_count:160 }),
  mkApi({ title:"애플 워치 울트라2 티타늄 – 경매 W3",    category_key:"digital", image_urls:IMG.watch, startH:-72, endH:-6, start_price: 910_000, bids:[940_000, 990_000, 1_030_000], view_count:1320, bidder_count:230 }),
  mkApi({ title:"아이패드 프로 12.9 256GB – 경매 A4",    category_key:"digital", image_urls:IMG.ipad,  startH:-96, endH:-10, start_price: 1_010_000, bids:[1_090_000,1_230_000], view_count:980, bidder_count:198, recommended:true }),
  mkApi({ title:"갤럭시 Z Fold 6 256GB – 경매 Z4",       category_key:"digital", image_urls:IMG.zfold, startH:-110, endH:-4, start_price: 1_640_000, bids:[1_700_000,1_820_000], view_count:1150, bidder_count:172 }),
  mkApi({ title:"샤넬 클래식 라지 블랙 – 경매 C4",       category_key:"women-acc", image_urls:IMG.chanel, startH:-150, endH:-18, start_price: 3_150_000, bids:[3_220_000,3_390_000], view_count:2200, bidder_count:135 }),
  mkApi({ title:"나이키 덩크 로우 265 – 경매 N4",        category_key:"clothes", image_urls:IMG.nike,  startH:-50, endH:-1, start_price: 210_000, bids:[226_000,252_000], view_count:840, bidder_count:185 }),
  mkApi({ title:"애플 워치 울트라2 오션밴드 – 경매 W4",  category_key:"digital", image_urls:IMG.watch, startH:-130, endH:-14, start_price: 920_000, bids:[950_000,1_000_000], view_count:1280, bidder_count:220, recommended:true }),
  mkApi({ title:"다이슨 V15 무선청소기 – 경매 D4",       category_key:"home-appliance", image_urls:IMG.dyson, startH:-60, endH:-3, start_price: 795_000, bids:[820_000, 885_000], view_count:1020, bidder_count:162 }),
  mkApi({ title:"샤넬 클래식 미듐 캐비어 – 경매 C5",     category_key:"women-acc", image_urls:IMG.chanel, startH:-180, endH:-40, start_price: 3_250_000, bids:[3_320_000,3_480_000,3_590_000], view_count:2450, bidder_count:150 }),
];

/* ===== CategoryPopular → API 스키마로 확장 ===== */
function buildCategoryPopularMap() {
  const defaultSample = [
    { title: "삼성 무풍에어컨 17평형 (청정)", imageUrl: ha01 },
    { title: "LG 트롬 스타일러 S3BF",        imageUrl: ha02 },
    { title: "쿠쿠 압력밥솥 10인용",          imageUrl: ha03 },
    { title: "다이슨 V12 무선청소기",         imageUrl: ha04 },
    { title: "발뮤다 더 토스터 화이트",       imageUrl: ha05 },
    { title: "코웨이 얼음 정수기",            imageUrl: ha06 },
  ];
  const healthFoodSample = [
    { title: "오메가3 프리미엄 1200mg (180캡슐)", imageUrl: hf01 },
    { title: "프로바이오틱스 100억 유산균 (60포)", imageUrl: hf02 },
    { title: "비타민D3 4000IU (90정)",           imageUrl: hf03 },
    { title: "6년근 홍삼스틱 30포",               imageUrl: hf04 },
    { title: "밀크씨슬 간건강 (90정)",            imageUrl: hf05 },
    { title: "루테인 지아잔틴 (60캡슐)",          imageUrl: hf06 },
  ];
  const beautySample = [
    { title: "비타민C 브라이트닝 앰플 30ml",   imageUrl: bt01 },
    { title: "롱웨어 쿠션 파운데이션 21호",     imageUrl: bt02 },
    { title: "히알루론 산 에센스 50ml",        imageUrl: bt03 },
    { title: "수분진정 토너 300ml",             imageUrl: bt04 },
    { title: "아이크림 레티놀 20ml",           imageUrl: bt05 },
    { title: "자외선 차단 선크림 SPF50+ 50ml", imageUrl: bt06 },
  ];
  const map = {};
  CATEGORIES.forEach((c) => {
    const base =
      c.key === "health-food" ? healthFoodSample :
      c.key === "beauty" ? beautySample :
      defaultSample;
    map[c.key] = base.map((it, i) => ({ ...it, id: `${c.key}-${i}` }));
  });
  return map;
}

const PRICE_BASE = {
  digital: 600_000, "women-acc": 300_000, clothes: 200_000, "home-appliance": 250_000,
  "living-kitchen": 80_000, beauty: 30_000, "health-food": 40_000, book: 15_000,
  kids: 40_000, sports: 90_000, plant: 20_000, "game-hobby": 70_000, ticket: 50_000,
  furniture: 200_000, pet: 50_000, etc: 50_000, "food-processed": 40_000,
};

function buildAuctionsFromCategoryPopular_API() {
  const byCat = buildCategoryPopularMap();
  const pool = [];
  CATEGORIES.forEach((c) => (byCat[c.key] || []).forEach((p) =>
    pool.push({ ...p, category_key: c.key })
  ));
  const pick = (n) => pool.splice(0, Math.min(n, pool.length));

  const mkCatApi = ({ product, startH, endH, extra = 0 }) => {
    const base = PRICE_BASE[product.category_key] ?? 50_000;
    const start_price = base + extra;
    const k = seq;
    const step = 5_000 + (k % 5) * 5_000;
    const bidsCount = (k % 3) + 1;
    const bids = Array.from({ length: bidsCount }, (_, i) => start_price + step * (i + 1));

    const start_at = isoFromNow(startH * HOUR);
    const end_at = isoFromNow(endH * HOUR);
    const current_price = Math.max(start_price, ...bids);
    const status = isClosed(end_at, Date.now()) ? "done" : "ongoing";

    return {
      id: seq++,
      title: product.title,
      category_key: product.category_key,
      image_urls: [product.imageUrl],
      start_price,
      current_price,
      bid_count: bids.length,
      bidder_count: 100 + (k % 7) * 20,
      view_count: 800 + (k % 10) * 120 + Math.floor(extra / 1000),
      recommended: (k % 4) === 0,
      start_at,
      end_at,
      status,
      seller_location: { label: "경기 고양시 덕양구" },
      distance_km: 8.2,
    };
  };

  const TODAY_ENDING_MORE = pick(3).map((p, i) => mkCatApi({ product: p, startH: -8 - i * 2, endH: 1 + i,  extra: i * 10_000 }));
  const ONGOING_MORE      = pick(12).map((p, i) => mkCatApi({ product: p, startH: -48 - i * 3, endH: 24 + i * 6, extra: i * 8_000 }));
  const DONE_MORE         = pick(13).map((p, i) => mkCatApi({ product: p, startH: -120 - i * 4, endH: -4 - i * 3, extra: i * 6_000 }));

  return [...TODAY_ENDING_MORE, ...ONGOING_MORE, ...DONE_MORE];
}

/* 최종 원본(API 응답 아이템 배열) */
const RAW_API_ITEMS = [
  ...TODAY_ENDING_API,
  ...ONGOING_API,
  ...DONE_API,
  ...buildAuctionsFromCategoryPopular_API(),
];

/* =========================
   Component
   ========================= */
export default function AuctionList() {
  const location = useLocation();
  const { search } = location;
  const navigate = useNavigate();

  const [layout, setLayout] = useState("horizontal");
  const [page, setPage] = useState(1);

  // 탭: 'ongoing' | 'done' | 'hot' | 'rec'
  const [tab, setTab] = useState("ongoing");

  // 필터
  const [category, setCategory] = useState("all");
  const [price, setPrice] = useState({ min: 0, max: 0 });
  const [sort, setSort] = useState("");
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
  const [query, setQuery] = useState("");

  // URL → 초기 필터
  useEffect(() => {
    const qs = new URLSearchParams(search);

    const cat   = qs.get("cat") || "all";
    const tabQ  = qs.get("tab") || "ongoing";
    const start = qs.get("start") || "";
    const end   = qs.get("end") || "";
    const q     = qs.get("q") || "";

    const hasMin = qs.has("min");
    const hasMax = qs.has("max");
    const minNum = Number(qs.get("min"));
    const maxNum = Number(qs.get("max"));

    setCategory(cat);
    setTab(["ongoing","done","hot","rec"].includes(tabQ) ? tabQ : "ongoing");
    setDateFilter({ start, end });
    setQuery(q);
    setPrice({
      min: hasMin && Number.isFinite(minNum) ? minNum : 0,
      max: hasMax && Number.isFinite(maxNum) ? maxNum : 0,
    });
  }, [search]);

  // 30초마다 남은시간/상태 갱신
  const [nowTick, setNowTick] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNowTick(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  // API → ViewModel
  const VM = useMemo(() => {
    return RAW_API_ITEMS.map((r) => {
      const closed = isClosed(r.end_at, nowTick);
      const endsToday = isEndingTodayKST(r.end_at, nowTick);
      const inc = Math.max(0, (r.current_price ?? r.start_price) - r.start_price);
      const computedHot = (r.bidder_count ?? 0) * 2 + (r.view_count ?? 0) / 50 + inc / 10000;
      const hotScore = (r.hot_score ?? r.hotScore ?? null) ?? computedHot;

      return {
        id: r.id,
        category: r.category_key,
        title: r.title,
        images: r.image_urls,
        startAtISO: r.start_at,
        endAtISO: r.end_at,
        startAt: ymdTZ(r.start_at, "Asia/Seoul"),
        endAt: ymdTZ(r.end_at, "Asia/Seoul"),
        timeLeft: timeLeftFrom(r.end_at, nowTick),
        isClosed: closed,
        isEndingTodayOpen: endsToday && !closed,
        startPrice: r.start_price,
        currentPrice: r.current_price,
        views: r.view_count,
        bidders: r.bidder_count,
        isRecommended: !!r.recommended,
        hotScore,
      };
    });
  }, [nowTick]);

  // 필터/정렬 파이프라인
  const filtered = useMemo(() => {
    let arr = VM;

    // 0) 제목 검색
    if (query.trim()) {
      const qn = normalize(query);
      arr = arr.filter((x) => normalize(x.title).includes(qn));
    }

    // 1) 카테고리
    if (category !== "all") arr = arr.filter((x) => x.category === category);

    // 2) 날짜(겹치면 포함, KST)
    let startMs = kstMsFromYMD(dateFilter.start, false);
    let endMs   = kstMsFromYMD(dateFilter.end,   true);
    if (startMs != null && endMs != null) {
      if (startMs > endMs) [startMs, endMs] = [endMs, startMs];
      arr = arr.filter((x) => {
        const ed = new Date(x.endAtISO).getTime();
        return ed >= startMs && ed <= endMs;
      });
    } else if (startMs != null) {
      arr = arr.filter((x) => new Date(x.endAtISO).getTime() >= startMs);
    } else if (endMs != null) {
      arr = arr.filter((x) => new Date(x.endAtISO).getTime() <= endMs);
    }

    // 3) 가격
    const { min, max } = price;
    if (min > 0) arr = arr.filter((x) => x.currentPrice >= min);
    if (max > 0) arr = arr.filter((x) => x.currentPrice <= max);

    // 4) 탭
    switch (tab) {
      case "done":
        arr = arr.filter((x) => x.isClosed);
        break;
      case "rec":
        arr = arr.filter((x) => x.isRecommended);
        break;
      case "hot":
        arr = [...arr].sort((a, b) => b.hotScore - a.hotScore);
        break;
      case "ongoing":
      default:
        arr = arr.filter((x) => !x.isClosed);
        break;
    }

    // 5) 정렬(인기 탭 제외)
    if (tab !== "hot") {
      const sorter = {
        views:     (a, b) => b.views - a.views,
        priceLow:  (a, b) => a.currentPrice - b.currentPrice,
        priceHigh: (a, b) => b.currentPrice - a.currentPrice,
        bids:      (a, b) => (b.bidders ?? 0) - (a.bidders ?? 0),
      }[sort];
      if (sorter) arr = [...arr].sort(sorter);
    }
    return arr;
  }, [VM, query, category, dateFilter.start, dateFilter.end, price, tab, sort]);

  // 페이지네이션
  const PER_PAGE = layout === "horizontal" ? 6 : 9;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentItems = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filtered.slice(start, start + PER_PAGE);
  }, [filtered, page, PER_PAGE]);

  // 필터 변경 시 1페이지로
  useEffect(() => { setPage(1); }, [
    layout, query, category, tab, dateFilter.start, dateFilter.end, price.min, price.max, sort
  ]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages, page]);

  return (
    <div className={styles.page}>
      <div className={styles.body}>
        {/* 좌측: sticky 필터 */}
        <aside className={styles.aside}>
          {/* ✅ 내부 스크롤 컨테이너 */}
          <div className={styles.asideScroller}>
            <FilterSidebar
              categories={[{ key: "all", label: "전체" }, ...CATEGORIES]}
              activeCategory={category}
              price={price}
              sort={sort}
              query={query}
              onChangeQuery={setQuery}
              onChangeCategory={setCategory}
              onChangePrice={setPrice}
              onChangeSort={setSort}
              onClear={() => {
                setCategory("all");
                setPrice({ min: 0, max: 0 });
                setSort("");
                setDateFilter({ start: "", end: "" });
                setTab("ongoing");
                setQuery("");
                setPage(1);
                navigate({ pathname: location.pathname }, { replace: true });
              }}
            />
          </div>
        </aside>

        {/* 우측: 툴바 + 리스트 */}
        <div>
          <Toolbar
            activeTab={tab}
            onChangeTab={setTab}
            layout={layout}
            onToggleLayout={setLayout}
          />
          <main className={styles.main}>
            {layout === "horizontal" ? (
              <Horizontal items={currentItems} />
            ) : (
              <Vertical items={currentItems} />
            )}
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </main>
        </div>
      </div>
    </div>
  );
}
