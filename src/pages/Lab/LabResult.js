// src/pages/Lab/LabResult.jsx
import React from "react";
import "../../styles/Lab/Lab.css";

import LabModeTabs from "../../components/Lab/LabModeTabs";
import ResultPanel from "../../components/Lab/ResultPanel";
import InfoBox from "../../components/Lab/InfoBox";

function LabResult() {
  return (
    <div className="lab-page">
      <header className="lab-header">
        <div className="lab-title-wrap">
          <h1 className="lab-title">실험실 - 결과 보기</h1>
          <span className="lab-badge">BETA</span>
        </div>
        <p className="lab-subtitle">
          이후에는 여기에서 최근에 진행한 실험 결과를 다시 확인할 수 있도록 확장할
          예정입니다.
        </p>
      </header>

      <LabModeTabs active="result" />

      <div className="lab-main-layout">
        <div className="lab-right-panel lab-right-panel--full">
          {/* 결과 보기 탭에서는 항상 mock 결과가 있다고 가정 */}
          <ResultPanel mode="wear" hasMockResult={true} />
          <InfoBox
            title="안내"
            lines={[
              "현재는 예시 레이아웃만 표시됩니다.",
              "실제 데이터 연동 후에는 사용자별 실험 결과가 불러와질 예정입니다.",
            ]}
          />
        </div>
      </div>
    </div>
  );
}

export default LabResult;
