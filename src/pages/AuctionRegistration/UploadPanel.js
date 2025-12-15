// src/pages/AuctionRegistration/UploadPanel.js
import React, { useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import styles from "../../styles/AuctionRegistration/UploadPanel.module.css";
import { uploadAuctionImages, suggestTitleFromImage } from "../../api/auctions/service";

const API_TO_UI_CATEGORY = {
  HOME_APPLIANCE: "home-appliance",
  HEALTH_FOOD: "health-food",
  BEAUTY: "beauty",
  FOOD_PROCESSED: "food-processed",
  PET: "pet",
  DIGITAL: "digital",
  LIVING_KITCHEN: "living-kitchen",
  WOMEN_ACC: "women-acc",
  SPORTS: "sports",
  PLANT: "plant",
  GAME_HOBBY: "game-hobby",
  TICKET: "ticket",
  FURNITURE: "furniture",
  BOOK: "book",
  KIDS: "kids",
  CLOTHES: "clothes",
  ETC: "etc",
};

export default function UploadPanel({
  images = [],
  onChange,
  onMetaChange,
  maxCount = 10,
  shouldAutoFillTitle = true,
}) {
  const fileInputRef = useRef(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");

  const openChooser = () => fileInputRef.current?.click();

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;

    const canAdd = Math.max(0, maxCount - images.length);
    const picked = files.slice(0, canAdd);
    if (!picked.length) return;

    try {
      setError("");
      const res = await uploadAuctionImages(picked);
      const urls = res?.result?.imageUrls || [];
      if (!urls.length) throw new Error("이미지 업로드에 실패했습니다. 다시 시도해 주세요.");

      const appended = picked.map((f, i) => ({
        file: f,
        url: URL.createObjectURL(f),
        uploadedUrl: urls[i],
      }));
      onChange?.([...images, ...appended]);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "이미지 업로드 중 오류가 발생했습니다.";
      setError(msg);
    }
  };

  const removeAt = (idx) => {
    const list = images.filter((_, i) => i !== idx);
    onChange?.(list);
  };

  const counterLabel = useMemo(
    () => `${images.length} / ${Math.max(1, maxCount)} 장`,
    [images.length, maxCount]
  );

  const canAnalyze = images.length >= 1 && !analyzing;

  const handleAnalyze = async () => {
    if (!canAnalyze) return;
    setAnalyzing(true);
    setError("");
    setAnalysis(null);

    try {
      const firstUploadedUrl =
        images.find((it) => it?.uploadedUrl)?.uploadedUrl || images[0]?.uploadedUrl;

      if (!firstUploadedUrl) {
        throw new Error("이미지 업로드 URL을 찾을 수 없습니다. 업로드 후 다시 시도하세요.");
      }

      const apiRes = await suggestTitleFromImage(firstUploadedUrl);
      const r = apiRes?.result || {};

      const rawName = (r.productName || "(분석 결과 없음)").trim().replace(/\s+/g, " ");
      const safeName = rawName.slice(0, 30);           // ✅ 30자 제한
      const next = {
        productName: safeName,
        category: r.category || "ETC",
        confidence: Number(r.confidence ?? 0),
      };
      setAnalysis(next);

      // ✅ name은 항상 AI 인식 모델명(30자 이내)로 고정
      onMetaChange?.("name", safeName);

      // ✅ 자동 제목도 30자 이내로 세팅(사용자가 나중에 수정 가능)
      if (shouldAutoFillTitle) {
        onMetaChange?.("title", safeName);
      }

      // 부가 메타 및 카테고리 자동 선택
      onMetaChange?.("aiResult", next);
      onMetaChange?.("aiText", `AI가 “${safeName}” (카테고리: ${next.category}, 신뢰도: ${next.confidence})로 인식했습니다.`);
      const uiKey = {
        HOME_APPLIANCE: "home-appliance",
        HEALTH_FOOD: "health-food",
        BEAUTY: "beauty",
        FOOD_PROCESSED: "food-processed",
        PET: "pet",
        DIGITAL: "digital",
        LIVING_KITCHEN: "living-kitchen",
        WOMEN_ACC: "women-acc",
        SPORTS: "sports",
        PLANT: "plant",
        GAME_HOBBY: "game-hobby",
        TICKET: "ticket",
        FURNITURE: "furniture",
        BOOK: "book",
        KIDS: "kids",
        CLOTHES: "clothes",
        ETC: "etc",
      }[next.category] || "etc";
      onMetaChange?.("categories", [uiKey]);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "AI 분석 중 오류가 발생했습니다.");
      onMetaChange?.("aiResult", null);
      onMetaChange?.("aiText", "");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <h3 className={styles.title}>상품 등록 & AI 분석</h3>
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
        <span className={`${styles.counter} ${images.length ? styles.ok : styles.warn}`}>{counterLabel}</span>
        {images.length === 0 && <span className={styles.hint}>최소 1장을 업로드해주세요.</span>}
      </div>

      <div className={styles.modelRow}>
        <button
          type="button"
          className={styles.aiBtn}
          onClick={handleAnalyze}
          disabled={!canAnalyze}
          title={!images.length ? "이미지 1장 이상 필요" : ""}
        >
          <Icon icon="solar:ghost-smile-linear" className={styles.iconAi} />
          {analyzing ? "분석 중..." : "AI 분석하기"}
        </button>
      </div>

      {analysis && (
        <div className={styles.aiResultBox}>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>AI 인식 상품명</span>
            <strong className={styles.resultValue}>{analysis.productName}</strong>
          </div>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>카테고리</span>
            <strong className={styles.resultValue}>{analysis.category}</strong>
          </div>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>신뢰도</span>
            <strong className={styles.resultValue}>{analysis.confidence}</strong>
          </div>
        </div>
      )}

      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}
