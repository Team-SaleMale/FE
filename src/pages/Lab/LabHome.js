// src/pages/Lab/LabHome.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Lab/Lab.css";

import InfoBox from "../../components/Lab/InfoBox";
import LabModeTabs from "../../components/Lab/LabModeTabs";

function LabHome() {
  const navigate = useNavigate();

  const goWear = () => navigate("/lab/wear");
  const goDecor = () => navigate("/lab/decor");

  return (
    <div className="lab-page">
      <header className="lab-header">
        <div className="lab-title-wrap">
          <h1 className="lab-title">실험실</h1>
          <span className="lab-badge">BETA</span>
        </div>
        <p className="lab-subtitle">
          내 사진과 상품 사진을 조합해서, 미리 입어보고 배치해보는 실험 공간입니다.
        </p>
      </header>

      <LabModeTabs active="home" />

      <section className="lab-home-grid">
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

        <div className="lab-home-card">
          <h2 className="lab-home-card-title">집에 배치해보기 실험실</h2>
          <p className="lab-home-card-desc">
            내 방 사진과 가구·벽지 사진을 업로드해, 배치했을 때의 느낌을 미리 확인해보세요.
          </p>
          <button
            type="button"
            className="lab-home-card-button"
            onClick={goDecor}
          >
            배치해보러 가기
          </button>
        </div>
      </section>

      <InfoBox
        title="안내"
        lines={[
          "이 기능은 아직 실험실(BETA) 단계입니다.",
          "이미지 합성 결과는 실제와 다를 수 있으며, 참고용으로만 사용해주세요.",
          "API 연동 전까지는 UI 미리보기 용도로만 제공됩니다.",
        ]}
      />
    </div>
  );
}

export default LabHome;
