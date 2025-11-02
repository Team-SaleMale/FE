// src/pages/AuctionRegistration/AuctionRegistration.js
// 상품 등록 화면 (JSON POST 버전)
// - 등록 API: POST /auctions/registration (application/json)

import React, { useMemo, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/AuctionRegistration/AuctionRegistration.module.css";

import UploadPanel from "./UploadPanel";
import BasicInfoForm from "./BasicInfoForm";
import PriceAndSchedule from "./PriceAndSchedule";
import CategoryChips from "./CategoryChips";
import TradeMethod from "./TradeMethod";
import PolicyConsent from "./PolicyConsent";
import PreviewCard from "./PreviewCard";
import SubmitBar from "./SubmitBar";

import { registerAuction } from "../../api/auctions/service";
// 디버깅용(선택): 전송 직전 payload 확인
import { buildRegistrationPayload } from "../../api/auctions/buildRegistrationPayload";

/** 중앙 상태 */
const initialState = {
  // UploadPanel
  images: [], // [{ file, url, uploadedUrl? }]
  modelName: "",
  aiResult: null, // {marketPrice, suggestedPrice}

  // BasicInfoForm
  title: "",
  description: "",

  // PriceAndSchedule
  startPrice: "", // number string
  startDate: "",  // UI 표시용(서버 전송 안함)
  endDate: "",    // "YYYY-MM-DDTHH:mm" (분까지)

  // CategoryChips (단일 선택)
  categories: [], // e.g., ["home-appliance"]

  // TradeMethod
  tradeMethod: "",   // 하위호환(단일, "택배"|"직거래"|"기타")
  tradeMethods: [],  // 신규(다중): ["택배","직거래","기타"]
  tradeNote: "",

  // PolicyConsent
  consents: { policy: false, info: false, shipping: false, fees: false },
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.key]: action.value };
    case "SET_IMAGES":
      return { ...state, images: action.value };
    case "SET_CONSENT":
      return { ...state, consents: { ...state.consents, [action.key]: action.value } };
    default:
      return state;
  }
}

export default function AuctionRegistration() {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  /** 프리뷰 계산: 현재가 = 시작가 × 120% */
  const previewImage = useMemo(() => state.images[0]?.url || "", [state.images]);
  const previewCurrent = useMemo(() => {
    const p = Number(state.startPrice || 0);
    return p > 0 ? Math.round(p * 1.2) : 0;
  }, [state.startPrice]);

  const previewData = {
    imageUrl: previewImage,
    title: state.title || "제목을 입력하면 여기에 표시됩니다",
    views: 1500,
    bidders: 1260,
    timeLeftLabel: "01:45:20",
    startPrice: Number(state.startPrice || 0),
    currentPrice: previewCurrent,
  };

  /** 검증 (현재시각을 인자로 받아 종료시간과 비교) */
  const validate = (nowISO) => {
    if (state.images.length < 1) return "이미지를 1장 이상 업로드해주세요.";
    if (!state.modelName.trim()) return "상품 모델명을 입력해주세요.";
    if (!state.title.trim()) return "제목을 입력해주세요.";

    const startPriceNum = Number(state.startPrice);
    if (!Number.isFinite(startPriceNum) || startPriceNum <= 0) {
      return "초기 가격을 올바르게 입력해주세요 (0보다 큰 숫자).";
    }

    // 종료시간 형식/미래시점 확인
    if (!state.endDate) return "경매 종료 시간을 설정해주세요.";
    const endMinute = String(state.endDate).slice(0, 16); // "YYYY-MM-DDTHH:mm"
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(endMinute)) {
      return "종료 시간 형식이 올바르지 않습니다. (YYYY-MM-DDTHH:mm)";
    }
    if (new Date(endMinute) <= new Date(nowISO)) {
      return "종료 시간이 현재 시각 이후가 되도록 선택해주세요.";
    }

    if (state.categories.length !== 1) return "카테고리를 한 개 선택해주세요.";

    // ✅ 거래 방식: 문자열/배열 모두 안전 체크 (trim은 문자열일 때만)
    const hasTrade =
      (Array.isArray(state.tradeMethods) && state.tradeMethods.length > 0) ||
      (typeof state.tradeMethod === "string" && state.tradeMethod.trim() !== "");
    if (!hasTrade) return "거래 방식을 1개 이상 선택해주세요.";

    if (!state.consents.policy) return "정책 동의를 체크해주세요.";
    return "";
  };

  /** 제출 (JSON POST) */
  const handleSubmit = async () => {
    const nowISO = new Date().toISOString();
    const msg = validate(nowISO);
    if (msg) return setError(msg);

    setError("");
    setSubmitting(true);
    try {
      // 업로더에서 받은 공개 URL 추출(없으면 빈 배열)
      const imageUrls =
        state.images?.map((it) => it.uploadedUrl).filter(Boolean) ?? [];

      // (선택) 전송 전 payload 확인
      const debugPayload = buildRegistrationPayload(state, { imageUrls });
      console.log("[registerAuction] payload", debugPayload);

      const res = await registerAuction(state, { imageUrls });

      // 성공 → 완료/상세 페이지로 이동
      navigate("/auctions/success", {
        state: {
          preview: previewData,
          startDate: nowISO,
          endDate: state.endDate,
          itemId: res?.result?.itemId ?? res?.itemId,
        },
      });
    } catch (e) {
      // 서버 메시지를 최대한 그대로 표시
      const data = e?.response?.data;
      const m =
        data?.message ||
        data?.result?.message ||
        e?.message ||
        "등록 중 오류가 발생했습니다.";
      setError(m);
      console.warn("[registerAuction] error", e?.response || e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.pageWrap}>
      <div className={styles.grid}>
        {/* 좌측: 입력 영역 */}
        <div className={styles.leftCol}>
          <section className={styles.section}>
            <UploadPanel
              images={state.images}
              onChange={(imgs) => dispatch({ type: "SET_IMAGES", value: imgs })}
              onMetaChange={(k, v) => dispatch({ type: "SET_FIELD", key: k, value: v })}
            />
          </section>

          <section className={styles.section}>
            <BasicInfoForm
              title={state.title}
              description={state.description}
              onChange={(k, v) => dispatch({ type: "SET_FIELD", key: k, value: v })}
            />
          </section>

          <section className={styles.section}>
            <PriceAndSchedule
              startPrice={state.startPrice}
              startDate={state.startDate}
              endDate={state.endDate}
              onChange={(k, v) => dispatch({ type: "SET_FIELD", key: k, value: v })}
            />
          </section>

          <section className={styles.section}>
            <CategoryChips
              value={state.categories}
              onChange={(v) => dispatch({ type: "SET_FIELD", key: "categories", value: v })}
              title="카테고리 선택"
              helper="원하는 카테고리가 없으면 ‘기타’를 선택하세요."
            />
          </section>

          <section className={styles.section}>
            <TradeMethod
              method={state.tradeMethod}       // 하위호환(단일)
              methods={state.tradeMethods}     // 신규(다중)
              note={state.tradeNote}
              onChange={(k, v) => dispatch({ type: "SET_FIELD", key: k, value: v })}
            />
          </section>

          <section className={styles.section}>
            <PolicyConsent
              value={state.consents}
              onChange={(k, v) => dispatch({ type: "SET_CONSENT", key: k, value: v })}
            />
          </section>
        </div>

        {/* 우측: 미리보기 */}
        <aside className={styles.rightCol}>
          <PreviewCard {...previewData} />
        </aside>
      </div>

      {/* 하단 고정 등록 버튼 */}
      <SubmitBar onSubmit={handleSubmit} loading={submitting} error={error} />
    </div>
  );
}
