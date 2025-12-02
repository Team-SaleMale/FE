// src/pages/Lab/LabWear.jsx
import React, { useState } from "react";
import "../../styles/Lab/Lab.css";

import LabModeTabs from "../../components/Lab/LabModeTabs";
import UploadPanel from "../../components/Lab/UploadPanel";
import ResultPanel from "../../components/Lab/ResultPanel";
import InfoBox from "../../components/Lab/InfoBox";

function LabWear() {
  // 실험 결과가 준비되었는지 여부 (mock용)
  const [hasMockResult, setHasMockResult] = useState(false);

  // "실험해보기" 버튼 눌렀을 때 호출할 함수
  const handleRunExperiment = () => {
    // 나중에 API 붙일 때는 여기서 실제 요청 보내면 됨.
    setHasMockResult(true);
  };

  return (
    <div className="lab-page">
      <header className="lab-header">
        <div className="lab-title-wrap">
          <h1 className="lab-title">실험실 - 입어보기</h1>
          <span className="lab-badge">BETA</span>
        </div>
        <p className="lab-subtitle">
          내 전신 사진과 입어보고 싶은 바지·상의 사진을 업로드해서 착용 이미지를 미리
          확인해보는 실험입니다.
        </p>
      </header>

      <LabModeTabs active="wear" />

      <div className="lab-main-layout">
        <div className="lab-left-panel">
          {/* UploadPanel에서 실험해보기 버튼 누를 때 이 콜백을 호출하도록 */}
          <UploadPanel mode="wear" onRunExperiment={handleRunExperiment} />
        </div>
        <div className="lab-right-panel">
          {/* ResultPanel에 mock 결과 여부 전달 */}
          <ResultPanel mode="wear" hasMockResult={hasMockResult} />
          <InfoBox
            title="안내"
            lines={[
              "전신이 잘 보이는 사진을 업로드하면 더 자연스러운 결과를 기대할 수 있습니다.",
              "실제 착용감, 핏, 색감은 이미지와 다를 수 있습니다.",
            ]}
          />
        </div>
      </div>
    </div>
  );
}

export default LabWear;
