// src/pages/AuctionRegistraion/AuctionRegistraion.js
// 상품 등록 화면 (JSON POST 버전)
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
import { buildRegistrationPayload } from "../../api/auctions/buildRegistrationPayload";

/** 중앙 상태 */
const initialState = {
  images: [],
  aiResult: null,

  // 제목/이름
  title: "",
  titleEdited: false, // 사용자가 직접 수정했는지
  name: "", // 항상 AI 인식 모델명 유지
  description: "",

  startPrice: "",
  startDate: "",
  endDate: "",

  categories: [],
  tradeMethod: "",
  tradeMethods: [],
  tradeNote: "",

  consents: { policy: false, info: false, shipping: false, fees: false },
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.key]: action.value };
    case "SET_IMAGES":
      return { ...state, images: action.value };
    case "SET_CONSENT":
      return {
        ...state,
        consents: { ...state.consents, [action.key]: action.value },
      };
    default:
      return state;
  }
}

export default function AuctionRegistration() {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  /* 프리뷰 */
  const previewImages = useMemo(
    () => (state.images || []).map((it) => it?.url).filter(Boolean),
    [state.images]
  );
  const previewImage = useMemo(
    () => previewImages[0] || "",
    [previewImages]
  );

  const previewCurrent = useMemo(() => {
    const p = Number(state.startPrice || 0);
    return p > 0 ? Math.round(p * 1.2) : 0;
  }, [state.startPrice]);

  const previewData = {
    imageUrl: previewImage,
    images: previewImages,
    title:
      state.title || state.name || "제목을 입력하면 여기에 표시됩니다",
    views: 1500,
    bidders: 1260,
    timeLeftLabel: "01:45:20",
    startPrice: Number(state.startPrice || 0),
    currentPrice: previewCurrent,
  };

  /** 검증 */
  const validate = (nowISO) => {
    if (state.images.length < 1)
      return "이미지를 1장 이상 업로드해주세요.";
    // ✅ 서버 필수: name은 AI 분석으로만 세팅됨
    if (!state.name.trim())
      return "AI 분석으로 상품명을 먼저 인식하세요.";

    const startPriceNum = Number(state.startPrice);
    if (!Number.isFinite(startPriceNum) || startPriceNum <= 0) {
      return "초기 가격을 올바르게 입력해주세요 (0보다 큰 숫자).";
    }

    if (!state.endDate) return "경매 종료 시간을 설정해주세요.";
    const endMinute = String(state.endDate).slice(0, 16);
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(endMinute)) {
      return "종료 시간 형식이 올바르지 않습니다. (YYYY-MM-DDTHH:mm)";
    }
    if (new Date(endMinute) <= new Date(nowISO)) {
      return "종료 시간이 현재 시각 이후가 되도록 선택해주세요.";
    }

    if (state.categories.length !== 1)
      return "카테고리를 한 개 선택해주세요.";

    const hasTrade =
      (Array.isArray(state.tradeMethods) &&
        state.tradeMethods.length > 0) ||
      (typeof state.tradeMethod === "string" &&
        state.tradeMethod.trim() !== "");
    if (!hasTrade) return "거래 방식을 1개 이상 선택해주세요.";

    if (!state.consents.policy) return "정책 동의를 체크해주세요.";
    return "";
  };

  /** 제출 */
  const handleSubmit = async () => {
    const nowISO = new Date().toISOString();
    const msg = validate(nowISO);
    if (msg) return setError(msg);

    setError("");
    setSubmitting(true);
    try {
      const imageUrls =
        state.images?.map((it) => it.uploadedUrl).filter(Boolean) ?? [];
      const debugPayload = buildRegistrationPayload(state, { imageUrls });
      console.log("[registerAuction] payload", debugPayload);

      const res = await registerAuction(state, { imageUrls });

      navigate("/auctions/success", {
        state: {
          preview: previewData,
          startDate: nowISO,
          endDate: state.endDate,
          itemId: res?.result?.itemId ?? res?.itemId,
        },
      });
    } catch (e) {
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

  // 🔧 제목 입력: title만 변경(<=30자), name은 유지
  const handleBasicChange = (k, v) => {
    if (k === "title") {
      const trimmed = String(v ?? "").slice(0, 30);
      if (!state.titleEdited) {
        dispatch({
          type: "SET_FIELD",
          key: "titleEdited",
          value: true,
        });
      }
      dispatch({ type: "SET_FIELD", key: "title", value: trimmed });
      return;
    }
    dispatch({ type: "SET_FIELD", key: k, value: v });
  };

  return (
    <div className={styles.pageWrap}>
      <div className={styles.grid}>
        <div className={styles.leftCol}>
          <section className={styles.section}>
            <UploadPanel
              images={state.images}
              onChange={(imgs) =>
                dispatch({ type: "SET_IMAGES", value: imgs })
              }
              onMetaChange={(k, v) =>
                dispatch({ type: "SET_FIELD", key: k, value: v })
              }
              shouldAutoFillTitle={!state.titleEdited} // 사용자가 수정 전이면 AI가 title을 채움
            />
          </section>

          <section className={styles.section}>
            <BasicInfoForm
              title={state.title}
              description={state.description}
              onChange={handleBasicChange}
            />
          </section>

          <section className={styles.section}>
            <PriceAndSchedule
              startPrice={state.startPrice}
              startDate={state.startDate}
              endDate={state.endDate}
              onChange={(k, v) =>
                dispatch({ type: "SET_FIELD", key: k, value: v })
              }
            />
          </section>

          <section className={styles.section}>
            <CategoryChips
              value={state.categories}
              onChange={(v) =>
                dispatch({
                  type: "SET_FIELD",
                  key: "categories",
                  value: v,
                })
              }
              title="카테고리 선택"
              helper="원하는 카테고리가 없으면 ‘기타’를 선택하세요."
            />
          </section>

          <section className={styles.section}>
            <TradeMethod
              method={state.tradeMethod}
              methods={state.tradeMethods}
              note={state.tradeNote}
              onChange={(k, v) =>
                dispatch({ type: "SET_FIELD", key: k, value: v })
              }
            />
          </section>

          <section className={styles.section}>
            <PolicyConsent
              value={state.consents}
              onChange={(k, v) =>
                dispatch({
                  type: "SET_CONSENT",
                  key: k,
                  value: v,
                })
              }
            />
          </section>
        </div>

        <aside className={styles.rightCol}>
          <PreviewCard
            key={previewImages.join("|")}
            {...previewData}
          />
        </aside>
      </div>

      <SubmitBar
        onSubmit={handleSubmit}
        loading={submitting}
        error={error}
      />
    </div>
  );
}
