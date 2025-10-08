// src/pages/AuctionRegistration/AuctionRegistration.js
import React, { useMemo, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/AuctionRegistration/AuctionRegistration.module.css";

import UploadPanel from "./UploadPanel";
import BasicInfoForm from "./BasicInfoForm";
import PriceAndSchedule from "./PriceAndSchedule";
import CategoryChips from "./CategoryChips";
// import TagsInput from "./TagsInput"; // 사용 안 함
import TradeMethod from "./TradeMethod";
import PolicyConsent from "./PolicyConsent";
import PreviewCard from "./PreviewCard";
import SubmitBar from "./SubmitBar";

/** 중앙 상태 */
const initialState = {
  // UploadPanel
  images: [],                     // [{file, url}]
  modelName: "",                  // 상품 모델명 (필수)
  aiResult: null,                 // {marketPrice, suggestedPrice}

  // BasicInfoForm
  title: "",
  description: "",

  // PriceAndSchedule
  startPrice: "",                 // number string
  startDate: "",                  // ISO string (datetime-local value)
  endDate: "",

  // CategoryChips (단일 선택)
  categories: [],                 // [] 또는 [key | customText]

  // TradeMethod
  tradeMethod: "",                // "택배" | "직거래" | "기타"
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

/** 사전에 정의된 카테고리 key (기타 직접 입력은 여기에 없음) */
const KNOWN_CATEGORY_KEYS = new Set([
  "home-appliance","health-food","beauty","food-processed","pet","digital",
  "living-kitchen","women-acc","sports","plant","game-hobby","ticket",
  "furniture","book","kids","clothes","etc"
]);

export default function AuctionRegistration() {
  const navigate = useNavigate();

  const [state, dispatch] = useReducer(reducer, initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  /** UploadPanel → 상위 상태 저장 */
  const handleMetaChange = (key, value) => {
    dispatch({ type: "SET_FIELD", key, value });
  };

  /** 간단 검증 */
  const validate = () => {
    if (state.images.length < 5) return "이미지를 최소 5장 업로드해주세요.";
    if (!state.modelName.trim()) return "상품 모델명을 입력해주세요.";
    if (!state.title.trim()) return "제목을 입력해주세요.";
    if (!state.startPrice) return "초기 가격을 입력해주세요.";
    if (!state.startDate || !state.endDate) return "경매 시작/종료 시간을 설정해주세요.";
    if (state.categories.length !== 1) return "카테고리를 한 개 선택해주세요.";
    if (!state.consents.policy) return "정책 동의를 체크해주세요.";
    return "";
  };

  /** 우측 미리보기(임시 값 보정) */
  const previewImage = useMemo(() => state.images[0]?.url || "", [state.images]);
  const previewCurrent = useMemo(() => {
    const p = Number(state.startPrice || 0);
    return p > 0 ? Math.round(p * 1.2) : 0; // 120%
  }, [state.startPrice]);

  // 완료 페이지에서도 그대로 사용할 프리뷰 스냅샷
  const previewData = {
    imageUrl: previewImage,
    title: state.title || "제목을 입력하면 여기에 표시됩니다",
    views: 1500,
    bidders: 1260,
    timeLeftLabel: "01:45:20",
    startPrice: Number(state.startPrice || 0),
    currentPrice: previewCurrent,
  };

  /** 제출 */
  const handleSubmit = async () => {
    const msg = validate();
    if (msg) return setError(msg);

    setError("");
    setSubmitting(true);
    try {
      // FormData payload (이미지 포함)
      const form = new FormData();
      form.append("modelName", state.modelName);
      form.append("title", state.title);
      form.append("description", state.description);
      form.append("startPrice", state.startPrice);
      form.append("startDate", state.startDate);
      form.append("endDate", state.endDate);
      form.append("tradeMethod", state.tradeMethod);
      form.append("tradeNote", state.tradeNote);

      // 카테고리 정리
      const selected = state.categories[0] || "";
      const normalizedCategory =
        !selected || selected === "etc" ? [] : [selected];
      form.append("categories", JSON.stringify(normalizedCategory));

      form.append("consents", JSON.stringify(state.consents));
      if (state.aiResult) form.append("aiResult", JSON.stringify(state.aiResult));
      state.images.forEach(({ file }, i) =>
        form.append("images", file, file?.name || `image_${i}.jpg`)
      );

      // TODO: API 연결 시 실제 요청
      console.log("[AuctionRegistration] submit payload(FormData)", {
        ...state,
        categories: normalizedCategory,
        images: state.images.map((i) => ({ name: i.file?.name, size: i.file?.size })),
      });

      // ✅ 등록 성공했다고 가정하고 완료 페이지로 이동 + 프리뷰/날짜 전달
      navigate("/auctions/success", {
        state: {
          preview: previewData,
          startDate: state.startDate,
          endDate: state.endDate,
        },
      });
    } catch (e) {
      setError(e?.message || "등록 중 오류가 발생했습니다.");
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
              onMetaChange={handleMetaChange} // modelName, aiResult
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
              onChange={(v) => {
                dispatch({ type: "SET_FIELD", key: "categories", value: v });
              }}
              title="카테고리 선택"
              helper="원하는 카테고리가 없는 경우 ‘기타’로 직접 입력하세요."
            />
          </section>

          <section className={styles.section}>
            <TradeMethod
              method={state.tradeMethod}
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
