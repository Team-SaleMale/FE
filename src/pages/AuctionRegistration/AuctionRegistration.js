// src/pages/AuctionRegistration/AuctionRegistration.js
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

/** 중앙 상태 */
const initialState = {
  // UploadPanel
  images: [],                 // [{file, url}]
  modelName: "",
  aiResult: null,             // {marketPrice, suggestedPrice}

  // BasicInfoForm
  title: "",
  description: "",

  // PriceAndSchedule
  startPrice: "",             // number string
  startDate: "",              // ISO string (UI 표시용; 실제 전송 값은 제출 시각으로 대체)
  endDate: "",                // ISO string

  // CategoryChips (단일 선택)
  categories: [],             // [] 또는 ["digital" | "etc" | ...key]

  // TradeMethod
  tradeMethod: "",            // 하위호환(단일)
  tradeMethods: [],           // 신규(다중): ["택배","직거래","기타"]
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

  const handleMetaChange = (key, value) => {
    dispatch({ type: "SET_FIELD", key, value });
  };

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

  /** 단일/다중 혼재 상태를 배열로 정규화 */
  const normalizedTradeMethods = (s) => {
    if (Array.isArray(s.tradeMethods) && s.tradeMethods.length > 0) return s.tradeMethods;
    return s.tradeMethod ? [s.tradeMethod] : [];
  };

  /** 검증 (제출 시각을 인자로 받아 비교) */
  const validate = (submitStartISO) => {
    if (state.images.length < 1) return "이미지를 1장 이상 업로드해주세요.";
    if (!state.modelName.trim()) return "상품 모델명을 입력해주세요.";
    if (!state.title.trim()) return "제목을 입력해주세요.";
    if (!state.startPrice) return "초기 가격을 입력해주세요.";

    if (!submitStartISO) return "시작 시간이 유효하지 않습니다.";
    if (!state.endDate) return "경매 종료 시간을 설정해주세요.";

    if (new Date(state.endDate) <= new Date(submitStartISO)) {
      return "종료 시간이 시작 시간 이후가 되도록 선택해주세요.";
    }
    if (state.categories.length !== 1) return "카테고리를 한 개 선택해주세요.";
    if (!state.consents.policy) return "정책 동의를 체크해주세요.";
    return "";
  };

  /** 제출 */
  const handleSubmit = async () => {
    // ✅ 시작시간 = "지금(제출 시각)"으로 강제
    const submitStartISO = new Date().toISOString();

    const msg = validate(submitStartISO);
    if (msg) return setError(msg);

    setError("");
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("modelName", state.modelName);
      form.append("title", state.title);
      form.append("description", state.description);
      form.append("startPrice", state.startPrice);     // 서버 숫자 파싱
      form.append("startDate", submitStartISO);        // ✅ 시작 = 제출 시각(고정)
      form.append("endDate", state.endDate);           // ✅ 종료 = 사용자 선택

      // 거래 방식: 신규 배열 + 하위호환 필드 동시 전송
      const tradeMethods = normalizedTradeMethods(state);
      form.append("tradeMethods", JSON.stringify(tradeMethods));
      form.append("tradeMethod", tradeMethods[0] || "");
      form.append("tradeNote", state.tradeNote);

      // ✅ 카테고리(단일): 이제 'etc'도 정상 값으로 그대로 전송
      const selected = state.categories[0] || "";
      const normalizedCategory = selected ? [selected] : [];
      form.append("categories", JSON.stringify(normalizedCategory));

      form.append("consents", JSON.stringify(state.consents));
      if (state.aiResult) form.append("aiResult", JSON.stringify(state.aiResult));

      state.images.forEach(({ file }, i) =>
        form.append("images", file, file?.name || `image_${i}.jpg`)
      );

      // TODO: 실제 API POST
      console.log("[AuctionRegistration] submit payload(FormData)", {
        ...state,
        startDate: submitStartISO,
        tradeMethods,
        categories: normalizedCategory,
        images: state.images.map((i) => ({ name: i.file?.name, size: i.file?.size })),
      });

      // 성공 가정 → 완료 페이지 이동
      navigate("/auctions/success", {
        state: {
          preview: previewData,
          startDate: submitStartISO,
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
              onMetaChange={handleMetaChange}
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
              /* 하위호환 + 신규 배열 동시 지원 */
              method={state.tradeMethod}
              methods={state.tradeMethods}
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
