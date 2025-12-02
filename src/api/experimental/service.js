// src/api/experimental/service.js
// NOTE: 실험실(Experimental) 관련 API 모음

import endpoints from "../endpoints";
import api, { post } from "../client"; // 기존 패턴 맞추기 (get, patch 있으면 그대로 둬도 됨)

// 상품 분석 요청
export const requestProductAnalysis = (productName) => {
  return post(endpoints.EXPERIMENTAL.PRODUCT_ANALYSIS, { productName });
};

// 브랜드 분석 요청
export const requestBrandAnalysis = (brandName) => {
  return post(endpoints.EXPERIMENTAL.BRAND_ANALYSIS, { brandName });
};

// --- 실험실: 가상 피팅 API ---
export const requestVirtualTryOn = ({ backgroundFile, garmentFile }) => {
  const formData = new FormData();
  formData.append("background", backgroundFile);
  formData.append("garment", garmentFile);

  return api.post(endpoints.EXPERIMENTAL.VIRTUAL_TRYON, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60000,
  });
};
