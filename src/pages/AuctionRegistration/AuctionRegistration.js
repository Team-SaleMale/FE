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

  // PriceAndSchedule (ISO는 PriceAndSchedule에서 날짜+시간 병합하여 set)
  startPrice: "",             // number string
  startDate: "",              // ISO string
  endDate: "",                // ISO string

  // CategoryChips (단일 선택)
  categories: [],

  // TradeMethod (다중 선택)
  tradeMethod: "",            // 🔁 하위호환용(과거 단일 선택)
  tradeMethods: [],           // ✅ 신규: ["택배","직거래","기타"]
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

  /** 검증 */
  const validate = () => {
    if (state.images.length < 1) return "이미지를 1장 이상 업로드해주세요.";
    if (!state.modelName.trim()) return "상품 모델명을 입력해주세요.";
    if (!state.title.trim()) return "제목을 입력해주세요.";
    if (!state.startPrice) return "초기 가격을 입력해주세요.";
    if (!state.startDate || !state.endDate) return "경매 시작/종료 시간을 설정해주세요.";
    if (new Date(state.endDate) <= new Date(state.startDate)) return "종료 시간이 시작 시간 이후가 되도록 선택해주세요.";
    if (state.categories.length !== 1) return "카테고리를 한 개 선택해주세요.";
    if (!state.consents.policy) return "정책 동의를 체크해주세요.";
    // 거래 방식은 선택 안 해도 통과(요구사항에 없음). 필요 시 아래 주석 해제
    // const methods = normalizedTradeMethods(state);
    // if (methods.length === 0) return "거래 방식을 한 개 이상 선택하거나 기타 내용을 입력해주세요.";
    return "";
  };

  /** 미리보기 데이터 */
  const previewImage = useMemo(() => state.images[0]?.url || "", [state.images]);
  const previewCurrent = useMemo(() => {
    const p = Number(state.startPrice || 0);
    return p > 0 ? Math.round(p * 1.2) : 0; // 시작가 × 120%
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

  /** 제출 */
  const handleSubmit = async () => {
    const msg = validate();
    if (msg) return setError(msg);

    setError("");
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("modelName", state.modelName);
      form.append("title", state.title);
      form.append("description", state.description);
      form.append("startPrice", state.startPrice); // 서버에서 숫자로 파싱
      form.append("startDate", state.startDate);   // ISO (날짜+시간)
      form.append("endDate", state.endDate);       // ISO (날짜+시간)

      // 거래 방식: 신규 배열 + 하위호환 필드 동시 전송
      const tradeMethods = normalizedTradeMethods(state);
      form.append("tradeMethods", JSON.stringify(tradeMethods));     // ✅ 권장
      form.append("tradeMethod", tradeMethods[0] || "");             // 🔁 구버전 호환
      form.append("tradeNote", state.tradeNote);

      // 카테고리(단일 선택, 기타면 빈 배열)
      const selected = state.categories[0] || "";
      const normalizedCategory = !selected || selected === "etc" ? [] : [selected];
      form.append("categories", JSON.stringify(normalizedCategory));

      form.append("consents", JSON.stringify(state.consents));
      if (state.aiResult) form.append("aiResult", JSON.stringify(state.aiResult));

      state.images.forEach(({ file }, i) =>
        form.append("images", file, file?.name || `image_${i}.jpg`)
      );

      // TODO: API 연결 시 실제 POST 요청
      console.log("[AuctionRegistration] submit payload(FormData)", {
        ...state,
        tradeMethods,
        categories: normalizedCategory,
        images: state.images.map((i) => ({ name: i.file?.name, size: i.file?.size })),
      });

      // 성공 가정 → 완료/확인 페이지로 이동
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
              helper="원하는 카테고리가 없는 경우 ‘기타’로 직접 입력하세요."
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
