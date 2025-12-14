// src/pages/HotDealRegistration/ProductSection.js
import { useEffect, useMemo, useState } from "react";
import styles from "../../styles/HotDealRegistration/ProductSection.module.css";

/** 빠른 가격 선택 옵션 (50만원, 100만원, 500만원 제거) */
const QUICK_PRICE_OPTIONS = [
  { value: 0, label: "0원" },
  { value: 100, label: "100원" },
  { value: 500, label: "500원" },
  { value: 1000, label: "1천원" },
  { value: 5000, label: "5천원" },
  { value: 10000, label: "1만원" },
  { value: 50000, label: "5만원" },
  { value: 100000, label: "10만원" },
];

/** 숫자만 추출 + 12자리 제한 + 비어있으면 "0" */
const normalizePrice = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return "0";
  return digits.slice(0, 12);
};

export default function ProductSection({ value, onChange }) {
  const set = (k, v) => onChange({ ...value, [k]: v });

  /* ---------------- 시작가(가격) 상태 ---------------- */
  const [priceInput, setPriceInput] = useState(value.price || "");
  const [priceHistory, setPriceHistory] = useState([]); // ["0", "1000", "51000", ...]

  // 부모 value.price가 바뀌면 표시 값만 맞춰줌 (히스토리는 유지)
  useEffect(() => {
    setPriceInput(value.price || "");
  }, [value.price]);

  // 화면에 표시할 금액(콤마 추가)
  const displayPrice = useMemo(() => {
    if (priceInput === "" || priceInput === null || priceInput === undefined)
      return "";
    const num = String(priceInput).replace(/\D/g, "");
    if (!num) return "";
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }, [priceInput]);

  // 부모에 price 반영
  const syncPrice = (numericString) => {
    set("price", numericString);
  };

  // 버튼(추천/빠른 선택)으로 가격 변경할 때: 히스토리에 현재 값 push
  const applyButtonPrice = (nextRaw) => {
    const currentNorm = normalizePrice(priceInput);
    const nextNorm = normalizePrice(nextRaw);

    if (currentNorm !== nextNorm) {
      setPriceHistory((prev) => [...prev, currentNorm || "0"]);
    }

    setPriceInput(nextNorm);
    syncPrice(nextNorm);
  };

  // 직접 입력: 히스토리는 쌓지 않고, 0원이 되면 히스토리 초기화
  const handlePriceChange = (e) => {
    const onlyNum = e.target.value.replace(/\D/g, "").slice(0, 12);
    const numeric = onlyNum === "" ? "0" : onlyNum;

    if (Number(numeric) === 0) {
      setPriceHistory([]); // 0원이면 이전 금액 스택 삭제
    }

    setPriceInput(numeric);
    syncPrice(numeric);
  };

  // 가격 추천: 1천 ~ 100만, 1천 단위 랜덤 (HotDeal도 동일 정책)
  const handleRecommendPrice = () => {
    const min = 1000;
    const max = 1000000;
    const step = 1000;

    const steps = Math.floor((max - min) / step) + 1;
    const randomStepIndex = Math.floor(Math.random() * steps);
    const value = min + randomStepIndex * step;

    applyButtonPrice(String(value));
  };

  // 빠른 가격 버튼
  // - 0원 버튼: 전체 리셋 (0원 + 히스토리 삭제)
  // - 나머지: 현재 값에 value 더해서 누적
  const handleQuickPrice = (valueOption) => {
    if (valueOption === 0) {
      const reset = "0";
      setPriceHistory([]);
      setPriceInput(reset);
      syncPrice(reset);
      return;
    }

    const currentNum = Number(normalizePrice(priceInput));
    const next = currentNum + valueOption;
    const clamped = Math.min(next, 999999999999);
    applyButtonPrice(String(clamped));
  };

  // 이전 금액: history 스택에서 한 단계씩 Pop
  const handlePrevPrice = () => {
    setPriceHistory((history) => {
      if (!history.length) return history;
      const prev = history[history.length - 1];
      const newHistory = history.slice(0, -1);

      setPriceInput(prev);
      syncPrice(prev);

      return newHistory;
    });
  };

  const hasPrev = priceHistory.length > 0;

  /* ---------------- 이미지/설명 로직 (기존 그대로) ---------------- */

  // 파일 선택 시: 기존 이미지 + 새 이미지 합치기 (최대 8장)
  const onFiles = (files) => {
    const incoming = Array.from(files || []);
    if (!incoming.length) return;

    const current = Array.isArray(value.images) ? value.images : [];
    const merged = [...current, ...incoming];

    set("images", merged.slice(0, 8)); // 첫 번째가 대표
  };

  // 특정 인덱스의 이미지 삭제
  const handleRemoveImage = (idx) => {
    const list = Array.isArray(value.images) ? value.images : [];
    const next = list.filter((_, i) => i !== idx);
    set("images", next);
  };

  // 선택된 이미지 → 미리보기 URL 목록
  const previews = useMemo(() => {
    if (!value.images || value.images.length === 0) return [];

    return value.images.map((img, idx) => {
      if (typeof img === "string") {
        return {
          key: `url-${idx}-${img}`,
          url: img,
          revoke: false,
        };
      }
      const url = URL.createObjectURL(img);
      return {
        key: `file-${idx}-${img.name}-${img.lastModified}`,
        url,
        revoke: true,
      };
    });
  }, [value.images]);

  // objectURL 정리
  useEffect(() => {
    return () => {
      previews.forEach((p) => {
        if (p.revoke) {
          try {
            URL.revokeObjectURL(p.url);
          } catch {
            // ignore
          }
        }
      });
    };
  }, [previews]);

  return (
    <div className={styles.card}>
      <h2 className={styles.h2}>상품 정보</h2>

      <label className={styles.label}>
        제목
        <input
          className={styles.input}
          value={value.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="예) 오늘 구운 크루아상 10개"
        />
      </label>

      <label className={styles.label}>
        시작가(원)
        <div className={styles.priceRow}>
          <input
            className={`${styles.input} ${styles.priceInput}`}
            value={displayPrice}
            onChange={handlePriceChange}
            inputMode="numeric"
            placeholder="예) 4,500"
          />
          <button
            type="button"
            className={styles.recommendBtn}
            onClick={handleRecommendPrice}
          >
            가격 추천
          </button>
          <button
            type="button"
            className={styles.previousBtn}
            onClick={handlePrevPrice}
            disabled={!hasPrev}
          >
            이전 금액
          </button>
        </div>

        <div className={styles.quickButtonsRow}>
          {QUICK_PRICE_OPTIONS.map((opt) => (
            <button
              key={opt.value + opt.label}
              type="button"
              className={styles.quickBtn}
              onClick={() => handleQuickPrice(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </label>

      <label className={styles.label}>
        <div className={styles.labelRow}>
          <span>이미지 선택(최대 8장)</span>
          <span className={styles.note}>
            첫 번째가 대표 이미지로 사용됩니다
          </span>
        </div>
        <input
          type="file"
          accept="image/*"
          multiple
          className={styles.fileInput}
          onChange={(e) => onFiles(e.target.files)}
        />
      </label>

      {previews.length > 0 && (
        <div className={styles.previewGrid}>
          {previews.map((p, idx) => (
            <div key={p.key} className={styles.previewItem}>
              <img
                src={p.url}
                alt={`상품 이미지 ${idx + 1}`}
                className={styles.previewImg}
              />
              {idx === 0 && (
                <span className={styles.previewTag}>대표</span>
              )}
              <button
                type="button"
                className={styles.previewRemove}
                onClick={() => handleRemoveImage(idx)}
                aria-label="이미지 삭제"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <label className={styles.label}>
        판매자 설명
        <textarea
          className={styles.textarea}
          value={value.desc}
          onChange={(e) => set("desc", e.target.value)}
          placeholder="상품 상태, 유통기한, 픽업 안내 등을 적어주세요."
        />
      </label>
    </div>
  );
}
