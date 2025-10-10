// src/pages/AuctionRegistration/UploadPanel.js
import React, { useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import styles from "../../styles/AuctionRegistration/UploadPanel.module.css";

/**
 * UploadPanel (API 미연결 버전)
 * - 최소 1장 업로드
 * - 상품명(필수)
 * - "AI 분석하기" → (onAnalyze가 있으면 호출, 없으면 mock 계산) → 결과/요약 노출
 * - 부모 저장: onChange(이미지 배열), onMetaChange('modelName' | 'aiModel' | 'aiResult' | 'aiText', value)
 */
export default function UploadPanel({
  images = [],
  onChange,
  onMetaChange,
  onAnalyze, // 실제 API 연결 시 상위에서 주입
  maxCount = 10,
}) {
  const fileInputRef = useRef(null);

  // 로컬 상태
  const [modelName, setModelName] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null); // { marketPrice, suggestedPrice, identifiedModel }
  const [analysisText, setAnalysisText] = useState(""); // 상세 설명 문장
  const [error, setError] = useState("");

  /** 파일 선택 열기 */
  const openChooser = () => fileInputRef.current?.click();

  /** 파일 업로드 */
  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const list = [...images];
    for (const f of files) {
      if (list.length >= maxCount) break;
      list.push({ file: f, url: URL.createObjectURL(f) });
    }
    onChange?.(list);
    setError("");
    e.target.value = ""; // 같은 파일 다시 선택 가능하도록 초기화
  };

  /** 업로드 삭제 */
  const removeAt = (idx) => {
    const list = images.filter((_, i) => i !== idx);
    onChange?.(list);
  };

  /** 검증 (최소 1장) */
  const hasMinImages = images.length >= 1;
  const hasModel = modelName.trim().length > 0;
  const canAnalyze = hasMinImages && hasModel && !analyzing;

  /** 모델명 변경 시 상위에 저장 */
  const onChangeModel = (v) => {
    setModelName(v);
    onMetaChange?.("modelName", v);
    // 모델이 바뀌면 이전 분석 결과 무효화
    if (analysis) {
      setAnalysis(null);
      setAnalysisText("");
      onMetaChange?.("aiModel", "");
      onMetaChange?.("aiResult", null);
      onMetaChange?.("aiText", "");
    }
  };

  /** 업로드 카운터 라벨 (1장 기준) */
  const counterLabel = useMemo(
    () => `${images.length} / ${Math.max(1, maxCount)} 장`,
    [images.length, maxCount]
  );

  /** 유틸: 간단한 타이틀 케이스 */
  const titleCase = (s) =>
    s
      .trim()
      .replace(/\s+/g, " ")
      .split(" ")
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
      .join(" ");

  /** (임시) 분석 로직 – API 없을 때 사용
   * identifiedModel: 사용자가 입력한 모델명을 정규화 + 더미 접미사 부여
   */
  const mockAnalyze = ({ modelName, images }) => {
    const base = 500_000 + modelName.trim().length * 20_000;
    const boost = Math.min(images.length, 10) * 30_000;
    const marketPrice = Math.round((base + boost) / 1000) * 1000;
    const suggestedPrice = Math.round((marketPrice * 0.95) / 1000) * 1000;

    // 더미: 입력값을 정규화해서 "AI 인식 모델명"으로 표기
    const normalized = titleCase(modelName.replace(/\s+/g, " "));
    const identifiedModel = `${normalized} (Wi-Fi, 256GB)`; // 필요시 임의 스펙 문구 조정

    return { marketPrice, suggestedPrice, identifiedModel };
  };

  /** 분석 실행 */
  const handleAnalyze = async () => {
    if (!canAnalyze) return;
    setAnalyzing(true);
    setError("");

    try {
      let result;
      if (typeof onAnalyze === "function") {
        // 실제 API가 생기면 { identifiedModel }을 함께 반환하도록 맞추면 됨.
        result = await onAnalyze({ modelName: modelName.trim(), images });
      } else {
        // API 미연결 → mock
        await new Promise((r) => setTimeout(r, 500));
        result = mockAnalyze({ modelName, images });
      }

      setAnalysis(result);

      // ✅ 상세 설명 문장 (사용자 입력 vs AI 인식 모델명 모두 표기)
      const userModel = modelName.trim();
      const aiModel = result.identifiedModel;
      const text =
        `올리신 모델명은 “${userModel}” 입니다. ` +
        `AI가 이미지/텍스트를 바탕으로 인식한 모델은 “${aiModel}” 로 판단했어요. ` +
        `현재 유사 매물 기준 예상 시세는 약 ₩${result.marketPrice.toLocaleString()}이며, ` +
        `ValueBid의 최근 거래 내역을 바탕으로 추천 시작가는 ₩${result.suggestedPrice.toLocaleString()} 입니다. ` +
        `실제 거래가는 제품 상태(외관, 배터리/내구성), 구성품(박스/영수증/액세서리), 남은 보증기간, 지역 수요에 따라 ` +
        `±10~20% 범위에서 변동될 수 있습니다. 사진을 더 추가하고 상세 설명을 작성하면 더 정확한 분석과 높은 낙찰률을 기대할 수 있어요.`;

      setAnalysisText(text);

      // 상위 저장 (등록 API 호출 때 함께 사용)
      onMetaChange?.("aiModel", aiModel);
      onMetaChange?.("aiResult", { marketPrice: result.marketPrice, suggestedPrice: result.suggestedPrice });
      onMetaChange?.("aiText", text);
    } catch (e) {
      setError(e?.message || "AI 분석 중 오류가 발생했습니다.");
      setAnalysis(null);
      setAnalysisText("");
      onMetaChange?.("aiModel", "");
      onMetaChange?.("aiResult", null);
      onMetaChange?.("aiText", "");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className={styles.wrap}>
      {/* 제목/설명 */}
      <h3 className={styles.title}>상품 등록 & AI 시세 분석</h3>
      <p className={styles.sub}>상품 이미지 업로드 ( 1장 이상 업로드 )</p>

      {/* 업로드 박스 */}
      <div className={styles.row}>
        <button
          type="button"
          className={styles.uploadBox}
          onClick={openChooser}
          aria-label="이미지 업로드"
        >
          <Icon icon="solar:camera-linear" className={styles.iconUpload} />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={handleFiles}
        />
      </div>

      {/* 썸네일 리스트 (가로 스크롤) */}
      {images.length > 0 && (
        <ul className={styles.thumbList} role="list">
          {images.map((img, i) => (
            <li key={i} className={styles.thumb}>
              <img src={img.url} alt={`업로드 이미지 ${i + 1}`} />
              <button
                type="button"
                className={styles.remove}
                onClick={() => removeAt(i)}
                aria-label="이미지 삭제"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* 카운터/힌트 */}
      <div className={styles.counterRow}>
        <span
          className={`${styles.counter} ${hasMinImages ? styles.ok : styles.warn}`}
        >
          {counterLabel}
        </span>
        {!hasMinImages && (
          <span className={styles.hint}>최소 1장을 업로드해주세요.</span>
        )}
      </div>

      {/* 모델명 + 분석 버튼 */}
      <label className={styles.modelLabel}>
        상품명 입력 <span className={styles.required}>*</span>
      </label>
      <div className={styles.modelRow}>
        <input
          className={styles.modelInput}
          placeholder="상품 모델명을 입력해주세요."
          value={modelName}
          onChange={(e) => onChangeModel(e.target.value)}
        />

        <button
          type="button"
          className={styles.aiBtn}
          onClick={handleAnalyze}
          disabled={!canAnalyze}
          title={!hasMinImages ? "이미지 1장 이상 필요" : !hasModel ? "상품명 입력 필요" : ""}
        >
          <Icon icon="solar:ghost-smile-linear" className={styles.iconAi} />
          {analyzing ? "분석 중..." : "AI 분석하기"}
        </button>
      </div>

      {/* 결과 박스 (AI 인식 모델명 + 가격 2줄) */}
      {analysis && (
        <div className={styles.aiResultBox}>
          {/* ✅ AI가 인식한 정확한 모델명 */}
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>AI 인식 모델</span>
            <strong className={styles.resultValue}>{analysis.identifiedModel}</strong>
          </div>

          {/* 시세/추천가 */}
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>예상 시세</span>
            <strong className={styles.resultValue}>
              ₩{analysis.marketPrice.toLocaleString()}
            </strong>
          </div>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>추천 시작가</span>
            <strong className={styles.resultValue}>
              ₩{analysis.suggestedPrice.toLocaleString()}
            </strong>
          </div>
        </div>
      )}

      {/* 상세 설명 문장 */}
      {analysisText && <p className={styles.aiSummary}>{analysisText}</p>}

      {/* 오류 메시지 */}
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}
