// src/pages/Lab/LabDecor.jsx
import React from "react";
import "../../styles/Lab/Lab.css";

import LabModeTabs from "../../components/Lab/LabModeTabs";
import UploadPanel from "../../components/Lab/UploadPanel";
import ResultPanel from "../../components/Lab/ResultPanel";
import InfoBox from "../../components/Lab/InfoBox";

function LabDecor() {
  return (
    <div className="lab-page">
      <header className="lab-header">
        <div className="lab-title-wrap">
          <h1 className="lab-title">실험실 - 집에 배치해보기</h1>
          <span className="lab-badge">BETA</span>
        </div>
        <p className="lab-subtitle">
          내 방 사진과 벽지·침대 등의 가구 사진을 업로드해, 실제로 배치했을 때 모습을
          미리 확인해보는 실험입니다.
        </p>
      </header>

      <LabModeTabs active="decor" />

      <div className="lab-main-layout">
        <div className="lab-left-panel">
          <UploadPanel mode="decor" />
        </div>
        <div className="lab-right-panel">
          <ResultPanel mode="decor" />
          <InfoBox
            title="안내"
            lines={[
              "벽과 바닥이 잘 보이는 사진을 업로드하면 더 자연스러운 결과를 기대할 수 있습니다.",
              "가구의 실제 크기와 비율은 이미지와 다를 수 있습니다.",
            ]}
          />
        </div>
      </div>
    </div>
  );
}

export default LabDecor;
