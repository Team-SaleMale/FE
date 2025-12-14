// src/components/Lab/LabModeTabs.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

function LabModeTabs({ active }) {
  const navigate = useNavigate();

  const goHome = () => navigate("/lab");
  const goWear = () => navigate("/lab/wear");
  const goProduct = () => navigate("/lab/product");
  const goBrand = () => navigate("/lab/brand");

  return (
    <div className="lab-tabs">
      <button
        type="button"
        className={`lab-tab ${active === "home" ? "lab-tab--active" : ""}`}
        onClick={goHome}
      >
        실험실 홈
      </button>

      <button
        type="button"
        className={`lab-tab ${active === "wear" ? "lab-tab--active" : ""}`}
        onClick={goWear}
      >
        입어보기
      </button>

      <button
        type="button"
        className={`lab-tab ${active === "product" ? "lab-tab--active" : ""}`}
        onClick={goProduct}
      >
        상품 분석
      </button>

      <button
        type="button"
        className={`lab-tab ${active === "brand" ? "lab-tab--active" : ""}`}
        onClick={goBrand}
      >
        브랜드 분석
      </button>
    </div>
  );
}

export default LabModeTabs;
