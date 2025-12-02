// src/pages/HotDealRegistration/HotDealRegistration.js
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/HotDealRegistration/HotDealRegistration.module.css";
import StoreSection from "./StoreSection";
import ProductSection from "./ProductSection";
import ScheduleSection from "./ScheduleSection";
import MapPreview from "./MapPreview";

import {
  fetchMyHotdealStore,
  uploadHotdealImages,
  registerHotdeal,
} from "../../api/hotdeals/service";
import buildHotdealRegistrationPayload from "../../api/hotdeals/buildRegistrationPayload";

// ✅ datetime-local용 로컬(KST 포함) 포맷 함수
function toLocalDateTimeInput(date) {
  const pad = (n) => String(n).padStart(2, "0");
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${y}-${m}-${d}T${h}:${min}`;
}

export default function HotDealRegistration() {
  const navigate = useNavigate();

  // 서버에서 고정 가게 정보 수신
  const [store, setStore] = useState({
    id: "",
    name: "",
    address: "",
    lat: 37.5665,
    lng: 126.978,
  });

  useEffect(() => {
    (async () => {
      try {
        const s = await fetchMyHotdealStore();
        if (!s) return;

        const mapped = {
          id: s.storeId,
          name: s.storeName,
          address: s.detailAddress
            ? `${s.address} ${s.detailAddress}`
            : s.address,
          lat: s.latitude,
          lng: s.longitude,
        };
        setStore(mapped);

        // 승인 상태 체크(필요 시 추가 UX)
        if (s.approvalStatus && s.approvalStatus !== "APPROVED") {
          console.warn("핫딜 등록 가능 상태가 아닙니다.", s.approvalStatus);
        }
      } catch (e) {
        console.error("내 핫딜 가게 정보 조회 실패", e);
      }
    })();
  }, []);

  // ✅ 상품 정보 (이미지 배열: 첫 번째가 대표)
  const [product, setProduct] = useState({
    title: "",
    price: "",
    images: [],
    desc: "",
  });

  // 대표 이미지 미리보기 URL
  const coverUrl = useMemo(() => {
    const first = product.images?.[0];
    if (!first) return "";
    return typeof first === "string" ? first : URL.createObjectURL(first);
  }, [product.images]);

  // objectURL 정리
  useEffect(() => {
    return () => {
      const first = product.images?.[0];
      if (first && typeof first !== "string") {
        try {
          URL.revokeObjectURL(coverUrl);
        } catch {
          // ignore
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ 페이지 진입 시각(로컬 시간, KST 포함)을 고정 "시작 시간"으로 사용
  const nowLocal = useMemo(() => toLocalDateTimeInput(new Date()), []);
  const [schedule, setSchedule] = useState(() => ({
    startsAt: nowLocal,
    endsAt: nowLocal,
  }));

  // 시작 시각 기준 3일 제한 (로컬 시간 기준)
  const maxEndsAt = useMemo(() => {
    const base = new Date(schedule.startsAt || nowLocal);
    base.setDate(base.getDate() + 3);
    return toLocalDateTimeInput(base);
  }, [schedule.startsAt, nowLocal]);

  const canSubmit = useMemo(() => {
    if (!store.name || !product.title || !product.price) return false;
    if (!schedule.endsAt) return false;

    const st = new Date(schedule.startsAt || nowLocal);
    const ed = new Date(schedule.endsAt);
    if (isNaN(st) || isNaN(ed) || ed <= st) return false;

    return ed - st <= 3 * 24 * 60 * 60 * 1000;
  }, [
    store.name,
    product.title,
    product.price,
    schedule.startsAt,
    schedule.endsAt,
    nowLocal,
  ]);

  // 등록하기 → 이미지 업로드 + 핫딜 등록 + /hotdeal 이동
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    if (!product.images || product.images.length === 0) {
      alert("이미지를 1장 이상 선택해 주세요.");
      return;
    }

    try {
      // 1) 이미지 업로드
      const fileImages = product.images.filter((img) => typeof img !== "string");
      const existingUrls = product.images.filter((img) => typeof img === "string");

      let uploadedUrls = [];
      if (fileImages.length > 0) {
        const tmp = await uploadHotdealImages(fileImages);
        uploadedUrls = Array.isArray(tmp) ? tmp : [];
      }

      const imageUrls = [...existingUrls, ...uploadedUrls];
      if (imageUrls.length === 0) {
        alert("이미지 업로드에 실패했습니다. 다시 시도해 주세요.");
        return;
      }

      // 2) 요청 payload 생성
      const payload = buildHotdealRegistrationPayload({
        product,
        schedule,
        imageUrls,
      });

      // 3) 핫딜 등록 API 호출
      if (typeof registerHotdeal !== "function") {
        console.error("registerHotdeal 가 함수가 아닙니다.", registerHotdeal);
        alert("핫딜 등록 API 설정에 문제가 있습니다. 콘솔을 확인해 주세요.");
        return;
      }

      const res = await registerHotdeal(payload);
      const result = res?.result ?? res ?? {};

      // 응답에서 hotdealId / itemId 추출 (백엔드 필드명 여러 경우 대비)
      const hotdealId =
        result.id ?? result.hotdealId ?? result.hotDealId ?? null;
      const itemId =
        result.itemId ?? result.auctionItemId ?? result.item?.id ?? null;

      // 4) 화면 미리보기용 초안 아이템
      const draft = {
        id: hotdealId || itemId || "draft-" + Date.now(),
        itemId, // ✅ DetailPanel에서 이미지 조회용
        title: product.title,
        storeName: store.name,
        lat: store.lat,
        lng: store.lng,
        startsAt: schedule.startsAt,
        endsAt: schedule.endsAt, // DetailPanel에서 바로 로컬 시간 확인
        startPrice: Number(product.price || 0),
        currentPrice: Number(product.price || 0),
        bidCount: 0,
        views: 0,
        sellerDesc: product.desc,
        // 업로드 직후에는 일단 이 URL들을 사용 (백업용)
        images: imageUrls,
        imageUrls,
        coverImg: imageUrls[0] || "",
      };

      // ✅ /hotdeal 로 이동 (HotDealPage에서 itemId로 상세 조회 → 이미지 사용)
      navigate("/hotdeal", { state: { draft } });
    } catch (err) {
      console.error("핫딜 등록 중 오류", err);
      alert(
        err?.friendlyMessage ||
          "핫딜 상품 등록에 실패했습니다. 잠시 후 다시 시도해 주세요."
      );
    }
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
            coverImg={coverUrl}
          />
          <div className={styles.previewInfo}>
            <h3>미리보기 정보</h3>
            <ul>
              <li>
                <b>{store.name || "가게명"}</b> · {store.address || "주소"}
              </li>
              <li>
                {product.title || "상품명"} / ₩
                {Number(product.price || 0).toLocaleString()}
              </li>
              <li>
                시작 {schedule.startsAt || "-"} ~ 마감 {schedule.endsAt || "-"}
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </form>
  );
}
