// src/pages/Lab/LabResult.jsx
import React, { useEffect, useState } from "react";
import "../../styles/Lab/Lab.css";

import LabModeTabs from "../../components/Lab/LabModeTabs";
import ResultPanel from "../../components/Lab/ResultPanel";
import InfoBox from "../../components/Lab/InfoBox";

function LabResult() {
  const [resultUrl, setResultUrl] = useState("");
  const [maskedUrl, setMaskedUrl] = useState("");
  const [hasResult, setHasResult] = useState(false);

  // [NEW] LabWear에서 저장해 둔 최근 결과 불러오기
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("lab_wear_last_result");
      if (!raw) {
        setHasResult(false);
        return;
      }

      const parsed = JSON.parse(raw);
      if (parsed?.resultUrl) {
        setResultUrl(parsed.resultUrl);
        setMaskedUrl(parsed.maskedUrl || "");
        setHasResult(true);
      } else {
        setHasResult(false);
      }
    } catch (e) {
      console.error(e);
      setHasResult(false);
    }
  }, []);

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
          <ResultPanel
            mode="wear"
            hasMockResult={hasResult}
            // [NEW] LabWear에서 저장해둔 실제 결과 이미지 전달
            resultUrl={resultUrl}
            maskedUrl={maskedUrl}
          />
          <InfoBox
            title="안내"
            lines={[
              hasResult
                ? "최근 입어보기 실험에서 생성된 가상 피팅 이미지를 다시 보여줍니다."
                : "아직 저장된 실험 결과가 없습니다. 먼저 입어보기 실험을 진행해 주세요.",
              "현재는 예시 레이아웃만 표시되지만, 실제 데이터 연동 후에는 사용자별 실험 결과가 불러와질 예정입니다.",
            ]}
          />
        </div>
      </div>
    </div>
  );
}

export default LabResult;
