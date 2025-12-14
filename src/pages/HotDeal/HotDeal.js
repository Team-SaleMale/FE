// src/pages/HotDeal/HotDeal.js
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../../styles/HotDeal/HotDeal.module.css";
import Toolbar from "./Toolbar";
import MapView from "./MapView";
import RoadView from "./RoadView";
import HotDealModal from "./HotDealModal";
import DetailPanel from "./DetailPanel";
import HotDealBid from "./HotDealBid";
import AuthCancelModal from "./AuthCancelModal";
import {
  fetchNearbyHotDeals,
  fetchMyHotdealStore,
} from "../../api/hotdeals/service";
import { fetchAuctionDetail, placeBid } from "../../api/auctions/service";

/* ==============================
   1) /hotdeals 리스트 정규화
   ============================== */

/** 응답 모양이 array / {items} / {result:{items}} / axios.data 등 어떤 형식이든 items만 추출 */
function extractHotDealItems(res) {
  if (!res) return [];

  if (Array.isArray(res)) return res;
  if (Array.isArray(res.items)) return res.items;
  if (Array.isArray(res.result?.items)) return res.result.items;

  if (res.data) {
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.data.items)) return res.data.items;
    if (Array.isArray(res.data.result?.items)) return res.data.result.items;
  }

  return [];
}

/** /hotdeals 한 개 row → MapView/RoadView 에서 쓰기 좋은 형태로 변환 */
function normalizeHotDealListItem(raw) {
  if (!raw) return null;

  const lat =
    raw.lat ??
    raw.latitude ??
    raw.storeLat ??
    raw.storeLatitude ??
    null;
  const lng =
    raw.lng ??
    raw.longitude ??
    raw.storeLng ??
    raw.storeLongitude ??
    null;

  // 이미지 배열 정리
  const imageUrls = Array.isArray(raw.imageUrls)
    ? raw.imageUrls.filter(Boolean)
    : [];
  const coverImg = raw.coverImg ?? imageUrls[0];

  return {
    ...raw,
    // 좌표 (MapView/RoadView는 lat/lng만 본다)
    lat,
    lng,

    // 타이틀은 없으면 name 으로 채워두기
    title: raw.title ?? raw.name ?? raw.storeName,

    // 가격 / 입찰수
    startPrice: raw.startPrice,
    currentPrice: raw.currentPrice,
    bidCount: raw.bidCount ?? raw.bidderCount,

    // 날짜
    startsAt: raw.startsAt ?? raw.createdAt ?? null,
    endsAt: raw.endsAt ?? raw.endTime ?? null,

    // 이미지 통일
    imageUrls,
    images: raw.images ?? undefined,
    coverImg,

    // 매장 이름
    storeName: raw.storeName ?? raw.sellerNickname,
  };
}

/* =====================================
   2) /auctions/{itemId} 상세 정규화
   ===================================== */

/** /auctions/{itemId} 상세 응답(JSON)을 화면에서 쓰기 좋은 형태로 정규화 */
function normalizeAuctionDetail(raw, base = {}) {
  if (!raw) return base || null;

  const auction = raw.auctionInfo || {};
  const seller = raw.sellerInfo || {};
  const region = raw.regionInfo || {};
  const trade = raw.tradeInfo || {};

  // 1) 이미지: object(imageUrl, imageOrder) → string url 배열
  const detailImages = Array.isArray(raw.images)
    ? [...raw.images]
        .sort((a, b) => (a.imageOrder ?? 0) - (b.imageOrder ?? 0))
        .map((img) => (typeof img === "string" ? img : img.imageUrl))
        .filter(Boolean)
    : [];

  const baseImages =
    (Array.isArray(base.imageUrls) && base.imageUrls) ||
    (Array.isArray(base.images) && base.images) ||
    (base.coverImg ? [base.coverImg] : []);

  const images = detailImages.length ? detailImages : baseImages;

  // 2) 입찰 내역: 항상 { price:number, bidder:string, ts:string } 형태로
  const bidHistory = Array.isArray(raw.bidHistory)
    ? raw.bidHistory.map((b) => ({
        price: Number(
          b.bidPrice ?? b.bidAmount ?? b.amount ?? b.price ?? 0
        ),
        bidder:
          b.bidder?.nickname ??
          b.bidderNickname ??
          b.nickname ??
          b.userNickname ??
          "",
        ts: b.bidTime ?? b.createdAt ?? b.ts ?? null,
      }))
    : [];

  return {
    // 리스트에서 넘어온 기본 정보 유지
    ...base,

    // 기본 아이템 정보
    id: raw.itemId ?? base.id,
    itemId: raw.itemId ?? base.itemId,
    title: raw.title ?? base.title,
    name: raw.name ?? base.name,
    description: raw.description ?? base.description,
    category: raw.category ?? base.category,
    itemStatus: raw.itemStatus ?? base.itemStatus,

    // 경매 가격/입찰 정보
    startPrice: auction.startPrice ?? base.startPrice,
    currentPrice: auction.currentPrice ?? base.currentPrice,
    bidIncrement: auction.bidIncrement ?? base.bidIncrement,
    bidCount:
      auction.bidCount ?? base.bidCount ?? base.bidderCount,

    // 날짜: 시작 = hotdeal/auction createdAt, 마감 = auctionInfo.endTime
    startsAt: raw.createdAt ?? base.startsAt ?? base.createdAt,
    endsAt: auction.endTime ?? base.endsAt ?? base.endTime,

    // 이미지
    images,
    imageUrls: images,
    coverImg: images[0] || base.coverImg,

    // 판매자 / 지역 / 거래 정보
    storeName:
      base.storeName ?? seller.nickname ?? base.sellerNickname,
    sellerNickname: seller.nickname ?? base.sellerNickname,
    sellerInfo: seller,
    regionInfo: region,
    tradeInfo: trade,
    tradeText: trade.tradeDetails ?? base.tradeText,
    tradeMethods: trade.tradeMethods ?? base.tradeMethods,

    // 입찰 내역
    bidHistory,
  };
}

/* ==============================
   3) HotDealPage 컴포넌트
   ============================== */

export default function HotDealPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [center, setCenter] = useState({
    lat: 37.5665,
    lng: 126.978,
  });
  const [radiusKm, setRadiusKm] = useState(3);
  const [mode, setMode] = useState("map");

  const [items, setItems] = useState([]);

  const [selectedItem, setSelectedItem] = useState(null); // 모달용 선택 아이템
  const [detailItem, setDetailItem] = useState(null); // 상세 API까지 포함한 아이템
  const [detailLoading, setDetailLoading] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false); // DetailPanel 오픈 여부

  const [bidOpen, setBidOpen] = useState(false);
  const [bidItem, setBidItem] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // 현재 위치
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setCenter({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => {}
    );
  }, []);

  // 주변(또는 전체) 핫딜 로드: /hotdeals 사용
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetchNearbyHotDeals({
          lat: center.lat,
          lng: center.lng,
          radiusKm,
        });

        if (!alive) return;

        const rawList = extractHotDealItems(res);
        const list = rawList
          .map(normalizeHotDealListItem)
          .filter(Boolean);

        setItems(list);
      } catch (e) {
        console.error("[HotDeal] 핫딜 조회 실패:", e);
        if (!alive) return;
        setItems([]);
      }
    })();

    return () => {
      alive = false;
    };
  }, [center.lat, center.lng, radiusKm]);

  // 등록페이지에서 넘어온 draft 반영 (등록 직후 DetailPanel 바로 열기)
  useEffect(() => {
    const draft = location.state?.draft;
    if (!draft) return;

    // 지도 중심을 가게 위치로 이동
    setCenter({ lat: draft.lat, lng: draft.lng });

    // 리스트 맨 앞에 임시 아이템 추가
    setItems((prev) => [draft, ...prev]);

    const itemKey = draft.itemId ?? draft.id ?? null;

    (async () => {
      if (itemKey == null) {
        // itemId 없으면, 등록 시점의 draft 정보로 그대로 띄움
        setDetailItem(draft);
        setDetailOpen(true);
        return;
      }

      try {
        // 등록 직후 한 번 실제 상세 API 호출 → 이미지 / 히스토리 포함
        const res = await fetchAuctionDetail(itemKey, {
          bidHistoryLimit: 30,
        });
        const raw = res?.result ?? res;
        const normalized = normalizeAuctionDetail(raw, draft);
        setDetailItem(normalized);
      } catch (e) {
        console.error("[HotDeal] 등록 직후 상세 조회 실패:", e);
        // 실패 시에도 최소한 draft는 보여주기
        setDetailItem(draft);
      } finally {
        setDetailOpen(true);
      }
    })();

    // URL state 정리
    navigate(".", { replace: true, state: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  // 핫딜 아이템 클릭 시 → 모달만 열고, 상세는 비동기 로딩
  const handleSelectItem = async (baseItem) => {
    if (!baseItem) return;

    setSelectedItem(baseItem); // HotDealModal 오픈
    setDetailOpen(false); // DetailPanel은 아직 닫아둠
    setDetailItem(null); // 이전 상세 데이터 초기화
    setDetailLoading(true);

    try {
      const itemId = baseItem.itemId ?? baseItem.id;
      if (itemId == null) {
        setDetailItem(baseItem);
        return;
      }

      const res = await fetchAuctionDetail(itemId, {
        bidHistoryLimit: 30,
      });
      const raw = res?.result ?? res;
      const normalized = normalizeAuctionDetail(raw, baseItem);
      setDetailItem(normalized); // 모달에서 richer 데이터 사용
    } catch (e) {
      console.error("[HotDeal] 상세 조회 실패:", e);
      // 실패 시에도 최소한 리스트 데이터는 모달에서 보여주기
      setDetailItem(baseItem);
    } finally {
      setDetailLoading(false);
    }
  };

  // HotDealModal의 "상세보기" 클릭 시 호출
  const openDetailFromModal = (item) => {
    setSelectedItem(null); // 모달 닫기
    setDetailItem((prev) => prev || item); // 혹시 모를 경우 대비
    setDetailOpen(true); // 이제 DetailPanel 오픈
  };

  const handleOpenBid = (item) => {
    const target = item || detailItem;
    if (!target) return;
    setBidItem(target);
    setBidOpen(true);
  };

  // ✅ 실제 입찰 API 호출 + 로컬 상태 업데이트
  const handleSubmitBid = async (price) => {
    if (!bidItem) throw new Error("선택된 상품이 없습니다.");

    const key = bidItem.itemId ?? bidItem.id;
    if (key == null) throw new Error("상품 ID가 없습니다.");

    const nPrice = Number(price);

    // 1) 서버에 입찰 요청
    const res = await placeBid(key, nPrice);
    const result = res?.result ?? res ?? {};

    const serverPrice = Number(
      result.currentPrice ?? result.bidPrice ?? result.price ?? nPrice
    );

    const resolveBidCount = (rawCount, baseCount) => {
      if (typeof rawCount === "number" && !Number.isNaN(rawCount)) {
        return rawCount;
      }
      if (typeof baseCount === "number" && !Number.isNaN(baseCount)) {
        return baseCount + 1;
      }
      return 1;
    };

    const updatePrice = (prevPrice) =>
      Math.max(Number(prevPrice ?? 0), serverPrice);

    const sameItem = (it) => (it.id ?? it.itemId) === key;

    // 2) 리스트 상태 업데이트
    setItems((prev) =>
      prev.map((it) =>
        sameItem(it)
          ? {
              ...it,
              currentPrice: updatePrice(it.currentPrice),
              bidCount: resolveBidCount(
                result.bidCount ?? result.bidderCount,
                it.bidCount ?? it.bidderCount
              ),
            }
          : it
      )
    );

    // 3) 상세 패널 상태 업데이트
    setDetailItem((prev) => {
      if (!prev || !sameItem(prev)) return prev;

      const baseBidCount = prev.bidCount ?? prev.bidderCount;

      return {
        ...prev,
        currentPrice: updatePrice(prev.currentPrice),
        bidCount: resolveBidCount(
          result.bidCount ?? result.bidderCount,
          baseBidCount
        ),
        bidHistory: [
          {
            price: serverPrice,
            bidder: "나",
            ts: Date.now(),
          },
          ...(prev.bidHistory || []),
        ],
      };
    });
  };

  const GOOGLE_FORM_URL =
    "https://forms.gle/pxrvVYqrcZZPS1oC9";

  // ✅ /hotdeals/my-store 로 실제 권한 확인
  async function checkBusinessAuth() {
    try {
      await fetchMyHotdealStore(); // 200이면 정상적으로 통과
      return { authorized: true };
    } catch (err) {
      const status = err?.response?.status ?? err?.status;

      // 400~499는 "사업자 미등록/권한 없음"으로 보고 전부 모달 처리
      if (status >= 400 && status < 500) {
        return { authorized: false, reason: "NO_STORE", status };
      }

      console.error("[HotDeal] /hotdeals/my-store 호출 실패:", err);
      return { authorized: false, reason: "ERROR", status, error: err };
    }
  }

  const handleClickRegister = async () => {
    const { authorized, reason } = await checkBusinessAuth();

    if (!authorized) {
      if (reason === "NO_STORE") {
        // ✅ 사업자 미등록 → AuthCancelModal 노출
        setAuthModalOpen(true);
      } else {
        // 진짜 서버 장애(5xx 등)만 알럿
        alert(
          "가게 정보를 확인하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
        );
      }
      return;
    }

    // 200 → 상품 등록 페이지로 이동
    // 로컬/배포 모두에서 사용 가능한 상대 경로
    navigate("/hotdeal/registration");
  };

  const DETAIL_WIDTH = 560;

  return (
    <div className={styles.root}>
      <Toolbar
        radiusKm={radiusKm}
        onRadiusChange={setRadiusKm}
        mode={mode}
        onModeChange={setMode}
        onClickRegister={handleClickRegister}
      />

      <div className={styles.canvas}>
        {mode === "map" ? (
          <MapView
            center={center}
            radiusKm={radiusKm}
            items={items}
            onSelect={handleSelectItem}
          />
        ) : (
          <RoadView
            center={center}
            radiusKm={radiusKm}
            items={items}
            onCenterChange={setCenter}
            onSelect={handleSelectItem}
          />
        )}

        <div className={styles.modalRoot}>
          <HotDealModal
            open={!!selectedItem}
            item={detailItem || selectedItem}
            loading={detailLoading}
            onClose={() => {
              setSelectedItem(null);
            }}
            onDetail={openDetailFromModal}
          />
        </div>
      </div>

      <DetailPanel
        item={detailOpen ? detailItem : null}
        onClose={() => setDetailOpen(false)}
        onBid={handleOpenBid}
      />

      <HotDealBid
        open={bidOpen}
        item={bidItem}
        onClose={() => setBidOpen(false)}
        onSubmit={handleSubmitBid}
        detailWidth={DETAIL_WIDTH}
      />

      <AuthCancelModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onOpenForm={() =>
          window.open(GOOGLE_FORM_URL, "_blank", "noopener,noreferrer")
        }
      />
    </div>
  );
}
