// src/pages/AuctionRegistration/UploadPanel.js
import React, { useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import styles from "../../styles/AuctionRegistration/UploadPanel.module.css";

/**
 * UploadPanel (API 미연결 버전)
 * - 최소 5장 업로드 유도
 * - 상품명(필수)
 * - "AI 분석하기" 클릭 → (onAnalyze가 있으면 호출, 없으면 mock 계산) → 결과와 요약문 노출
 * - 부모 저장: onChange(이미지 배열), onMetaChange('modelName' | 'aiResult' | 'aiText', value)
 *
 * props
 *  - images: [{ file: File, url: string }]
 *  - onChange(newImages)
 *  - onMetaChange(key, value)
 *  - onAnalyze?: async ({ modelName, images }) => ({ marketPrice, suggestedPrice })
 *  - maxCount?: number (default 10)
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
  const [analysis, setAnalysis] = useState(null); // { marketPrice, suggestedPrice }
  const [analysisText, setAnalysisText] = useState(""); // 요약 문장
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

  /** 검증 */
  const hasMinImages = images.length >= 5;
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
      onMetaChange?.("aiResult", null);
      onMetaChange?.("aiText", "");
    }
  };

  /** 업로드 카운터 라벨 */
  const counterLabel = useMemo(
    () => `${images.length} / ${Math.max(5, maxCount)} 장`,
    [images.length, maxCount]
  );

  /** (임시) 분석 로직 – API 없을 때 사용 */
  const mockAnalyze = ({ modelName, images }) => {
    const base = 500_000 + modelName.trim().length * 20_000;
    const boost = Math.min(images.length, 10) * 30_000;
    const marketPrice = Math.round((base + boost) / 1000) * 1000;
    const suggestedPrice = Math.round((marketPrice * 0.95) / 1000) * 1000;
    return { marketPrice, suggestedPrice };
  };

  /** 분석 실행 */
  const handleAnalyze = async () => {
    if (!canAnalyze) return;
    setAnalyzing(true);
    setError("");

    try {
      let result;
      if (typeof onAnalyze === "function") {
        result = await onAnalyze({ modelName: modelName.trim(), images });
      } else {
        // API 미연결 → mock
        await new Promise((r) => setTimeout(r, 500));
        result = mockAnalyze({ modelName, images });
      }

      setAnalysis(result);
      const text = `분석 결과: 예상 시세 ₩${result.marketPrice.toLocaleString()} · 추천 시작가 ₩${result.suggestedPrice.toLocaleString()}`;
      setAnalysisText(text);

      // 상위 저장 (등록 API 호출 때 함께 사용)
      onMetaChange?.("aiResult", result);
      onMetaChange?.("aiText", text);
    } catch (e) {
      setError(e?.message || "AI 분석 중 오류가 발생했습니다.");
      setAnalysis(null);
      setAnalysisText("");
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
      <p className={styles.sub}>상품 이미지 업로드 ( 최소 5가지의 사진 업로드)</p>

      {/* 업로드 박스 */}
      <div className={styles.row}>
        <button
          type="button"
          className={styles.uploadBox}
          onClick={openChooser}
          aria-label="이미지 업로드"
        >
          {/* 업로드 아이콘 */}
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
          <span className={styles.hint}>최소 5장을 업로드해주세요.</span>
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
          title={!hasMinImages ? "이미지 5장 이상 필요" : !hasModel ? "상품명 입력 필요" : ""}
        >
          <Icon icon="solar:ghost-smile-linear" className={styles.iconAi} />
          {analyzing ? "분석 중..." : "AI 분석하기"}
        </button>
      </div>

      {/* 숫자 결과 박스 (분석 후에만 노출) */}
      {analysis && (
        <div className={styles.aiResultBox}>
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

      {/* 분석 요약 문장 (버튼 아래 한 줄) */}
      {analysisText && <p className={styles.aiSummary}>{analysisText}</p>}

      {/* 오류 메시지 */}
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}
