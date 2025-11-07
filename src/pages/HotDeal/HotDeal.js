// 핫딜 페이지 컨테이너: 툴바 + (지도 or 로드뷰) + 우측 상세 패널 + 모달 + 입찰 패널
import { useEffect, useState } from "react";
import styles from "../../styles/HotDeal/HotDeal.module.css";
import Toolbar from "./Toolbar";
import MapView from "./MapView";
import RoadView from "./RoadView";
import HotDealModal from "./HotDealModal";
import DetailPanel from "./DetailPanel";
import HotDealBid from "./HotDealBid";
import { fetchNearbyHotDeals } from "../../api/hotdeals/service"; // ✅ 부모에서만 fetch

export default function HotDealPage() {
  const [center, setCenter] = useState({ lat: 37.5665, lng: 126.9780 });
  const [radiusKm, setRadiusKm] = useState(3);
  const [mode, setMode] = useState("map"); // "map" | "roadview"

  // 데이터(부모가 전담)
  const [items, setItems] = useState([]);

  // 모달/상세/입찰 상태
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [bidOpen, setBidOpen] = useState(false);
  const [bidItem, setBidItem] = useState(null);

  // 현재 위치 받아오기
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
  }, []);

  // ✅ center, radiusKm 바뀔 때마다 service.js에서 데이터 로드(부모 전담)
  useEffect(() => {
    let alive = true;
    (async () => {
      const data = await fetchNearbyHotDeals({ lat: center.lat, lng: center.lng, radiusKm });
      if (!alive) return;
      setItems(data || []);
    })();
    return () => { alive = false; };
  }, [center.lat, center.lng, radiusKm]);

  // 모달 → 상세 패널 오픈
  const openDetailFromModal = (item) => {
    setSelectedItem(null);
    setDetailItem(item);
  };

  // 상세 패널에서 "입찰하기"
  const handleOpenBid = (item) => {
    const target = item || detailItem;
    if (!target) return;
    setBidItem(target);
    setBidOpen(true);
  };

  // ✅ HotDealBid 제출 → 상세/리스트 동시 갱신 + 이벤트 발행(DetailPanel 히스토리 반영)
  const handleSubmitBid = async (price) => {
    // 서버 연동 위치 (예: await api.bids.place({ itemId: bidItem.id, price }))
    const id = bidItem?.id;
    const nPrice = Number(price);

    // 1) 리스트(부모 items) 낙관적 업데이트
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              currentPrice: Math.max(Number(it.currentPrice ?? 0), nPrice),
              bidCount: Number(it.bidCount ?? 0) + 1,
              // 선택사항: 최신 bidHistory 한 줄 추가(서비스 스펙에 맞게)
              bidHistory: [{ price: nPrice, bidder: "나(테스트)", ts: Date.now() }, ...(it.bidHistory || [])],
            }
          : it
      )
    );

    // 2) 상세 패널도 동기화
    setDetailItem((prev) =>
      prev && prev.id === id
        ? {
            ...prev,
            currentPrice: Math.max(Number(prev.currentPrice ?? 0), nPrice),
            bidCount: Number(prev.bidCount ?? 0) + 1,
          }
        : prev
    );

    // 3) DetailPanel이 듣고 있는 커스텀 이벤트 발행
    window.dispatchEvent(new CustomEvent("valuebid:bid-submitted", {
      detail: { itemId: id, price: nPrice, bidder: "나(테스트)", ts: Date.now() }
    }));

    // 4) 입찰 패널 닫기
    setBidOpen(false);
  };

  const DETAIL_WIDTH = 560;

  return (
    <div className={styles.root}>
      <Toolbar
        radiusKm={radiusKm}
        onRadiusChange={setRadiusKm}
        mode={mode}
        onModeChange={setMode}
      />

      <div className={styles.canvas}>
        {mode === "map" ? (
          <MapView
            center={center}
            radiusKm={radiusKm}
            items={items}                 // ✅ 부모가 내려줌
            onSelect={setSelectedItem}
          />
        ) : (
          <RoadView
            center={center}
            radiusKm={radiusKm}
            items={items}                 // ✅ 부모가 내려줌
            onCenterChange={setCenter}
            onSelect={setSelectedItem}
          />
        )}

        {/* 지도/로드뷰 위 모달 */}
        <div className={styles.modalRoot}>
          <HotDealModal
            open={!!selectedItem}
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onDetail={openDetailFromModal}
          />
        </div>
      </div>

      {/* 우측 상세 패널 */}
      <DetailPanel
        item={detailItem}
        onClose={() => setDetailItem(null)}
        onBid={handleOpenBid}
      />

      {/* 입찰 패널(상세 왼쪽) */}
      <HotDealBid
        open={bidOpen}
        item={bidItem}
        onClose={() => setBidOpen(false)}
        onSubmit={handleSubmitBid}
        detailWidth={DETAIL_WIDTH}
      />
    </div>
  );
}
