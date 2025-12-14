// src/pages/Lab/LabWear.jsx
import React, { useState } from "react";
import "../../styles/Lab/Lab.css";

import LabModeTabs from "../../components/Lab/LabModeTabs";
import UploadPanel from "../../components/Lab/UploadPanel";
import ResultPanel from "../../components/Lab/ResultPanel";
import InfoBox from "../../components/Lab/InfoBox";
import { requestVirtualTryOn } from "../../api/experimental/service";

function LabWear() {
  // 🔹 결과 유무 (기존 mock용)
  const [hasMockResult, setHasMockResult] = useState(false);

  // 🔹 실제 API 결과 상태
  const [resultUrl, setResultUrl] = useState("");
  const [maskedUrl, setMaskedUrl] = useState("");

  // 🔹 Before에 보여줄 “업로드한 전신 사진” 원본 URL
  const [beforeImageUrl, setBeforeImageUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // UploadPanel에서 호출
  const handleRunExperiment = async ({ backgroundFile, garmentFile }) => {
    if (!backgroundFile || !garmentFile) {
      setError("사람(배경) 이미지와 옷 이미지를 모두 업로드해주세요.");
      return;
    }

    // 🔹 업로드한 전신 사진을 Before에 그대로 보여주기 위해 URL 생성
    const beforeUrl = URL.createObjectURL(backgroundFile);
    // 이전 URL 있었으면 정리
    setBeforeImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return beforeUrl;
    });

    setLoading(true);
    setError("");
    setHasMockResult(false);
    setResultUrl("");
    setMaskedUrl("");

    try {
      const res = await requestVirtualTryOn({ backgroundFile, garmentFile });
      const data = res?.data ?? res;
      const result = data?.result ?? data;

      const nextResultUrl = result?.resultUrl || "";
      const nextMaskedUrl = result?.maskedUrl || "";

      if (!nextResultUrl) {
        setError("가상 피팅 결과 URL을 불러오지 못했습니다.");
        return;
      }

      setResultUrl(nextResultUrl);
      setMaskedUrl(nextMaskedUrl);
      setHasMockResult(true);

      // LabResult에서 최근 결과 다시 보기용 (원본도 같이 저장)
      const persisted = {
        resultUrl: nextResultUrl,
        maskedUrl: nextMaskedUrl,
        beforeUrl: beforeUrl,
        createdAt: Date.now(),
      };
      window.localStorage.setItem(
        "lab_wear_last_result",
        JSON.stringify(persisted)
      );
    } catch (e) {
      console.error(e);
      setError("가상 피팅 요청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
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
          <UploadPanel
            mode="wear"
            onRunExperiment={handleRunExperiment}
            loading={loading}
          />
        </div>
        <div className="lab-right-panel">
          <ResultPanel
            mode="wear"
            hasMockResult={hasMockResult}
            resultUrl={resultUrl}
            maskedUrl={maskedUrl}
            originalBeforeUrl={beforeImageUrl}   // 🔹 여기!
            loading={loading}
            error={error}
          />
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
