// src/pages/Lab/LabHome.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Lab/Lab.css";

import InfoBox from "../../components/Lab/InfoBox";
import LabModeTabs from "../../components/Lab/LabModeTabs";

function LabHome() {
  const navigate = useNavigate();

  const goWear = () => navigate("/lab/wear");
  const goProduct = () => navigate("/lab/product");
  const goBrand = () => navigate("/lab/brand");

  return (
    <div className="lab-page">
      <header className="lab-header">
        <div className="lab-title-wrap">
          <h1 className="lab-title">실험실</h1>
          <span className="lab-badge">BETA</span>
        </div>
        <p className="lab-subtitle">
          내 사진과 상품·브랜드 정보를 활용해, 미리 입어보고 분석해보는 실험 공간입니다.
        </p>
      </header>

      <LabModeTabs active="home" />

      <section className="lab-home-grid">
        {/* 입어보기 */}
        <div className="lab-home-card">
          <h2 className="lab-home-card-title">입어보기 실험실</h2>
          <p className="lab-home-card-desc">
            전신 사진과 옷 사진을 업로드하면, 실제로 입었을 때 모습을 미리 확인해볼 수 있어요.
          </p>
          <button
            type="button"
            className="lab-home-card-button"
            onClick={goWear}
          >
            입어보러 가기
          </button>
        </div>

        {/* 상품 분석 */}
        <div className="lab-home-card">
          <h2 className="lab-home-card-title">상품 분석 실험실</h2>
          <p className="lab-home-card-desc">
            상품명을 입력하면 예상 가치와 유사 상품 대조군, 향후 1~3년 추세를
            텍스트 리포트로 제공합니다.
          </p>
          <button
            type="button"
            className="lab-home-card-button"
            onClick={goProduct}
          >
            상품 분석하러 가기
          </button>
        </div>

        {/* 브랜드 분석 */}
        <div className="lab-home-card">
          <h2 className="lab-home-card-title">브랜드 분석 실험실</h2>
          <p className="lab-home-card-desc">
            명품/브랜드명을 입력하면 비슷한 브랜드·시장 대조군과 함께 예상 가치,
            향후 1~3년 추세를 한 번에 보여줍니다.
          </p>
          <button
            type="button"
            className="lab-home-card-button"
            onClick={goBrand}
          >
            브랜드 분석하러 가기
          </button>
        </div>
      </section>

      <InfoBox
        title="안내"
        lines={[
          "이 기능은 아직 실험실(BETA) 단계입니다.",
          "이미지 합성 및 텍스트 분석 결과는 실제와 다를 수 있으며, 참고용으로만 사용해주세요.",
          "일부 기능은 API 실험 단계로, 응답 속도나 결과 품질이 다소 불안정할 수 있습니다.",
        ]}
      />
    </div>
  );
}

export default LabHome;
