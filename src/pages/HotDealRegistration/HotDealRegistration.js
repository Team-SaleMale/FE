import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/HotDealRegistration/HotDealRegistration.module.css";
import StoreSection from "./StoreSection";
import ProductSection from "./ProductSection";
import ScheduleSection from "./ScheduleSection";
import MapPreview from "./MapPreview";
import { fetchMyStore } from "../../api/stores/service";

export default function HotDealRegistration() {
  const navigate = useNavigate();

  // 서버에서 고정 가게 정보 수신
  const [store, setStore] = useState({
    id: "",
    name: "",
    address: "",
    lat: 37.5665,
    lng: 126.9780,
  });

  useEffect(() => {
    (async () => {
      const s = await fetchMyStore();
      setStore(s);
    })();
  }, []);

  // ✅ 이미지 통합: 첫 번째가 대표
  const [product, setProduct] = useState({
    title: "",
    price: "",
    images: [], // File[] 또는 URL[] 혼합 가능
    desc: "",
  });

  // 대표 이미지 미리보기 URL (없으면 빈 문자열)
  const coverUrl = useMemo(() => {
    const first = product.images?.[0];
    if (!first) return "";
    return typeof first === "string" ? first : URL.createObjectURL(first);
  }, [product.images]);

  useEffect(() => {
    return () => {
      const first = product.images?.[0];
      if (first && typeof first !== "string") {
        try { URL.revokeObjectURL(coverUrl); } catch {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nowIso = useMemo(() => new Date().toISOString().slice(0, 16), []);
  const [schedule, setSchedule] = useState({
    startsAt: nowIso,
    endsAt: nowIso,
  });

  // 3일 제한
  const maxEndsAt = useMemo(() => {
    const base = new Date(schedule.startsAt || nowIso);
    base.setDate(base.getDate() + 3);
    return base.toISOString().slice(0, 16);
  }, [schedule.startsAt, nowIso]);

  const canSubmit = useMemo(() => {
    if (!store.name || !product.title || !product.price) return false;
    if (!schedule.startsAt || !schedule.endsAt) return false;
    const st = new Date(schedule.startsAt);
    const ed = new Date(schedule.endsAt);
    if (isNaN(st) || isNaN(ed) || ed <= st) return false;
    return (ed - st) <= 3 * 24 * 60 * 60 * 1000;
  }, [store, product, schedule]);

  // 등록하기 → /hotdeal 로 이동하며 draft 전달
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    // 화면 미리보기용 초안 아이템
    const imagesUrl = product.images.map((f) =>
      typeof f === "string" ? f : URL.createObjectURL(f)
    );
    const draft = {
      id: "draft-" + Date.now(),
      title: product.title,
      storeName: store.name,
      lat: store.lat,
      lng: store.lng,
      startsAt: schedule.startsAt,
      endsAt: schedule.endsAt,
      startPrice: Number(product.price || 0),
      currentPrice: Number(product.price || 0),
      bidCount: 0,
      views: 0,
      sellerDesc: product.desc,
      images: imagesUrl,
      coverImg: imagesUrl[0] || "",
    };

    navigate("/hotdeal", { state: { draft } });
  };

  return (
    <form className={styles.wrap} onSubmit={handleSubmit}>
      <header className={styles.header}>
        <h1 className={styles.title}>핫딜 상품 등록</h1>
        <button type="submit" className={styles.submitBtn} disabled={!canSubmit}>
          등록하기
        </button>
      </header>

      <div className={styles.grid}>
        <section className={styles.left}>
          <StoreSection value={store} onChange={setStore} />
          <ProductSection value={product} onChange={setProduct} />
          <ScheduleSection
            value={schedule}
            onChange={setSchedule}
            maxEndsAt={maxEndsAt}
          />
        </section>

        <aside className={styles.right}>
          <MapPreview
            lat={store.lat}
            lng={store.lng}
            storeName={store.name || "가게명"}
            productTitle={product.title}
            productPrice={product.price}
            coverImg={coverUrl /* 없으면 "" */}
          />
          <div className={styles.previewInfo}>
            <h3>미리보기 정보</h3>
            <ul>
              <li><b>{store.name || "가게명"}</b> · {store.address || "주소"}</li>
              <li>{product.title || "상품명"} / ₩{(Number(product.price||0)).toLocaleString()}</li>
              <li>시작 {schedule.startsAt || "-"} ~ 마감 {schedule.endsAt || "-"}</li>
            </ul>
          </div>
        </aside>
      </div>
    </form>
  );
}
