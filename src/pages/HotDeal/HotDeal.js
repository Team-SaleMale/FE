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
import { fetchNearbyHotDeals } from "../../api/hotdeals/service";

export default function HotDealPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [center, setCenter] = useState({ lat: 37.5665, lng: 126.9780 });
  const [radiusKm, setRadiusKm] = useState(3);
  const [mode, setMode] = useState("map");

  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [bidOpen, setBidOpen] = useState(false);
  const [bidItem, setBidItem] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // 현재 위치
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
  }, []);

  // 주변 핫딜 로드
  useEffect(() => {
    let alive = true;
    (async () => {
      const data = await fetchNearbyHotDeals({ lat: center.lat, lng: center.lng, radiusKm });
      if (!alive) return;
      setItems(Array.isArray(data) ? data : []);
    })();
    return () => { alive = false; };
  }, [center.lat, center.lng, radiusKm]);

  // 등록페이지에서 넘어온 draft 반영
  useEffect(() => {
    const draft = location.state?.draft;
    if (!draft) return;

    setCenter({ lat: draft.lat, lng: draft.lng });
    setItems(prev => [draft, ...prev]);
    setDetailItem(draft);

    // state 제거(뒤로가기/새로고침 중복 방지)
    navigate(".", { replace: true, state: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const openDetailFromModal = (item) => {
    setSelectedItem(null);
    setDetailItem(item);
  };

  const handleOpenBid = (item) => {
    const target = item || detailItem;
    if (!target) return;
    setBidItem(target);
    setBidOpen(true);
  };

  const handleSubmitBid = async (price) => {
    const id = bidItem?.id;
    const nPrice = Number(price);

    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              currentPrice: Math.max(Number(it.currentPrice ?? 0), nPrice),
              bidCount: Number(it.bidCount ?? 0) + 1,
              bidHistory: [{ price: nPrice, bidder: "나(테스트)", ts: Date.now() }, ...(it.bidHistory || [])],
            }
          : it
      )
    );

    setDetailItem((prev) =>
      prev && prev.id === id
        ? {
            ...prev,
            currentPrice: Math.max(Number(prev.currentPrice ?? 0), nPrice),
            bidCount: Number(prev.bidCount ?? 0) + 1,
          }
        : prev
    );

    window.dispatchEvent(new CustomEvent("valuebid:bid-submitted", {
      detail: { itemId: id, price: nPrice, bidder: "나(테스트)", ts: Date.now() }
    }));

    setBidOpen(false);
  };

  const GOOGLE_FORM_URL = "https://forms.gle/your-google-form-id";

  async function checkBusinessAuth() {
    const authorized = false;
    return authorized;
  }

  const handleClickRegister = async () => {
    const authorized = await checkBusinessAuth();
    if (!authorized) {
      setAuthModalOpen(true);
      return;
    }
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
            onSelect={setSelectedItem}
          />
        ) : (
          <RoadView
            center={center}
            radiusKm={radiusKm}
            items={items}
            onCenterChange={setCenter}
            onSelect={setSelectedItem}
          />
        )}

        <div className={styles.modalRoot}>
          <HotDealModal
            open={!!selectedItem}
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onDetail={openDetailFromModal}
          />
        </div>
      </div>

      <DetailPanel
        item={detailItem}
        onClose={() => setDetailItem(null)}
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
        onOpenForm={() => window.open(GOOGLE_FORM_URL, "_blank", "noopener,noreferrer")}
      />
    </div>
  );
}
