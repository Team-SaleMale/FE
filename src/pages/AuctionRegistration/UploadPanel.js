// src/pages/AuctionRegistration/UploadPanel.js
import React, { useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import styles from "../../styles/AuctionRegistration/UploadPanel.module.css";
import { uploadAuctionImages } from "../../api/auctions/service"; // ✅ 추가

export default function UploadPanel({
  images = [],
  onChange,
  onMetaChange,
  onAnalyze,
  maxCount = 10,
}) {
  const fileInputRef = useRef(null);

  const [modelName, setModelName] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [analysisText, setAnalysisText] = useState("");
  const [error, setError] = useState("");

  const openChooser = () => fileInputRef.current?.click();

  // ✅ 파일 업로드: 선택 → S3 업로드 → uploadedUrl 채워서 부모로 전달
  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ""; // 같은 파일 재선택 가능하도록 초기화
    if (!files.length) return;

    // 1) 개수 제한
    const canAdd = Math.max(0, maxCount - images.length);
    const picked = files.slice(0, canAdd);
    if (!picked.length) return;

    try {
      setError("");

      // 2) 업로드 API 호출 (temp S3 URL 획득)
      const res = await uploadAuctionImages(picked);
      const urls = res?.result?.imageUrls || [];

      if (!urls.length) {
        throw new Error("이미지 업로드에 실패했습니다. 다시 시도해 주세요.");
      }

      // 3) 썸네일용 로컬 URL과 서버의 uploadedUrl 매핑
      const appended = picked.map((f, i) => ({
        file: f,
        url: URL.createObjectURL(f),   // 미리보기용
        uploadedUrl: urls[i],          // ✅ 서버에서 받은 temp S3 URL
      }));

      onChange?.([...images, ...appended]);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "이미지 업로드 중 오류가 발생했습니다.";
      setError(msg);
    }
  };

  const removeAt = (idx) => {
    const list = images.filter((_, i) => i !== idx);
    onChange?.(list);
  };

  const hasMinImages = images.length >= 1;
  const hasModel = modelName.trim().length > 0;
  const canAnalyze = hasMinImages && hasModel && !analyzing;

  const onChangeModel = (v) => {
    setModelName(v);
    onMetaChange?.("modelName", v);
    if (analysis) {
      setAnalysis(null);
      setAnalysisText("");
      onMetaChange?.("aiModel", "");
      onMetaChange?.("aiResult", null);
      onMetaChange?.("aiText", "");
    }
  };

  const counterLabel = useMemo(
    () => `${images.length} / ${Math.max(1, maxCount)} 장`,
    [images.length, maxCount]
  );

  const titleCase = (s) =>
    s.trim().replace(/\s+/g, " ").split(" ")
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : "")).join(" ");

  const mockAnalyze = ({ modelName, images }) => {
    const base = 500_000 + modelName.trim().length * 20_000;
    const boost = Math.min(images.length, 10) * 30_000;
    const marketPrice = Math.round((base + boost) / 1000) * 1000;
    const suggestedPrice = Math.round((marketPrice * 0.95) / 1000) * 1000;
    const normalized = titleCase(modelName.replace(/\s+/g, " "));
    const identifiedModel = `${normalized} (Wi-Fi, 256GB)`;
    return { marketPrice, suggestedPrice, identifiedModel };
  };

  const handleAnalyze = async () => {
    if (!canAnalyze) return;
    setAnalyzing(true);
    setError("");
    try {
      let result;
      if (typeof onAnalyze === "function") {
        result = await onAnalyze({ modelName: modelName.trim(), images });
      } else {
        await new Promise((r) => setTimeout(r, 500));
        result = mockAnalyze({ modelName, images });
      }
      setAnalysis(result);
      const userModel = modelName.trim();
      const aiModel = result.identifiedModel;
      const text =
        `올리신 모델명은 “${userModel}” 입니다. ` +
        `AI가 인식한 모델은 “${aiModel}” 입니다. ` +
        `예상 시세 ₩${result.marketPrice.toLocaleString()}, ` +
        `추천 시작가 ₩${result.suggestedPrice.toLocaleString()}.`;
      setAnalysisText(text);
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
      <h3 className={styles.title}>상품 등록 & AI 시세 분석</h3>
      <p className={styles.sub}>상품 이미지 업로드 ( 1장 이상 업로드 )</p>

      <div className={styles.row}>
        <button type="button" className={styles.uploadBox} onClick={openChooser} aria-label="이미지 업로드">
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

      {images.length > 0 && (
        <ul className={styles.thumbList} role="list">
          {images.map((img, i) => (
            <li key={i} className={styles.thumb}>
              <img src={img.url} alt={`업로드 이미지 ${i + 1}`} />
              <button type="button" className={styles.remove} onClick={() => removeAt(i)} aria-label="이미지 삭제">×</button>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.counterRow}>
        <span className={`${styles.counter} ${hasMinImages ? styles.ok : styles.warn}`}>{counterLabel}</span>
        {!hasMinImages && <span className={styles.hint}>최소 1장을 업로드해주세요.</span>}
      </div>

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

      {analysis && (
        <div className={styles.aiResultBox}>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>AI 인식 모델</span>
            <strong className={styles.resultValue}>{analysis.identifiedModel}</strong>
          </div>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>예상 시세</span>
            <strong className={styles.resultValue}>₩{analysis.marketPrice.toLocaleString()}</strong>
          </div>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>추천 시작가</span>
            <strong className={styles.resultValue}>₩{analysis.suggestedPrice.toLocaleString()}</strong>
          </div>
        </div>
      )}

      {analysisText && <p className={styles.aiSummary}>{analysisText}</p>}
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}
