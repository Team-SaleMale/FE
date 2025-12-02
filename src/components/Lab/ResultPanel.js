// src/components/Lab/ResultPanel.jsx
import React, { useState } from "react";
import ImageCompareSlider from "./ImageCompareSlider";

import LabWearBefore1 from "../../assets/img/Lab/Lab_wear_before1.png";
import LabWearBefore2 from "../../assets/img/Lab/Lab_wear_before2.png";
import LabWearResult from "../../assets/img/Lab/Lab_wear_result.png";

function ResultPanel({
  mode,
  hasMockResult = false,
  resultUrl,
  maskedUrl,
  originalBeforeUrl,   // 🔹 업로드한 전신 원본 이미지 URL
  loading = false,
  error = "",
}) {
  const [view, setView] = useState("before"); // before | after | compare

  const isWear = mode === "wear";
  const isDecor = mode === "decor";

  const hasRealResult = !!resultUrl;
  const hasAnyResult = hasRealResult || hasMockResult;

  const getPlaceholderText = () => {
    if (loading) {
      return "AI가 가상 피팅을 진행 중입니다...";
    }

    if (!hasAnyResult) {
      if (view === "before") {
        return "업로드한 원본 이미지가 여기 표시될 예정입니다.";
      }

      if (isWear) {
        return "AI가 생성한 착용 이미지가 여기 표시될 예정입니다.";
      }

      if (isDecor) {
        return "AI가 생성한 배치 이미지가 여기 표시될 예정입니다.";
      }

      return "AI가 생성한 결과 이미지가 여기 표시될 예정입니다.";
    }

    // 결과는 있는데 뷰에 맞는 이미지가 없을 때
    if (view === "before") {
      return "원본 이미지를 불러오지 못했습니다. After 탭에서 결과 이미지를 확인해 주세요.";
    }

    return "";
  };

  // 🔹 비교 탭에서 사용할 이미지
  //    → Before: 가능하면 항상 “업로드한 전신 원본” 사용
  const compareBeforeImg = originalBeforeUrl
    ? originalBeforeUrl
    : hasMockResult
    ? LabWearBefore1
    : null;

  const compareAfterImg = hasRealResult
    ? resultUrl
    : hasMockResult
    ? LabWearResult
    : null;

  return (
    <div className="lab-result-panel">
      <div className="lab-result-header">
        <h2 className="lab-result-title">결과 미리보기</h2>
        <div className="lab-result-view-switch">
          <button
            type="button"
            className={`lab-result-view-btn ${view === "before" ? "active" : ""}`}
            onClick={() => setView("before")}
          >
            Before
          </button>
          <button
            type="button"
            className={`lab-result-view-btn ${view === "after" ? "active" : ""}`}
            onClick={() => setView("after")}
          >
            After
          </button>
          <button
            type="button"
            className={`lab-result-view-btn ${view === "compare" ? "active" : ""}`}
            onClick={() => setView("compare")}
          >
            비교
          </button>
        </div>
      </div>

      <div className="lab-result-body">
        {view === "compare" ? (
          // 🔹 비교 탭도 기존 박스 크기를 그대로 사용
          <div className="lab-result-placeholder">
            <div className="lab-result-image lab-result-image--compare">
              {compareBeforeImg && compareAfterImg ? (
                <ImageCompareSlider
                  beforeLabel="원본 이미지"
                  afterLabel={isWear ? "착용 이미지" : isDecor ? "배치 이미지" : "After"}
                  beforeImage={compareBeforeImg}
                  afterImage={compareAfterImg}
                />
              ) : (
                <span className="lab-result-image-text">
                  {hasAnyResult
                    ? "비교에 사용할 이미지를 불러오지 못했습니다. After 탭에서 결과 이미지를 확인해 주세요."
                    : getPlaceholderText()}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="lab-result-placeholder">
            {/* BEFORE 뷰 */}
            {view === "before" && (
              <div className="lab-result-image lab-result-image--before">
                {originalBeforeUrl ? (
                  // 🔹 항상 업로드한 전신 원본을 최우선으로 사용
                  <img
                    src={originalBeforeUrl}
                    alt="업로드한 전신 원본 이미지"
                    className="lab-result-image-inner"
                  />
                ) : hasMockResult ? (
                  <img
                    src={LabWearBefore1}
                    alt="입어보기 Before 예시"
                    className="lab-result-image-inner"
                  />
                ) : (
                  <span className="lab-result-image-text">
                    {getPlaceholderText()}
                  </span>
                )}
              </div>
            )}

            {/* AFTER 뷰 */}
            {view === "after" && (
              <div className="lab-result-image lab-result-image--after">
                {hasRealResult ? (
                  <img
                    src={resultUrl}
                    alt="가상 피팅 결과 이미지"
                    className="lab-result-image-inner"
                  />
                ) : hasMockResult ? (
                  <img
                    src={LabWearResult}
                    alt="입어보기 After 예시"
                    className="lab-result-image-inner"
                  />
                ) : (
                  <span className="lab-result-image-text">
                    {getPlaceholderText()}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="lab-result-footer">
        {error && <p className="lab-result-error">{error}</p>}
        <p className="lab-result-note">
          ※ 본 기능은 실험실(BETA) 단계의 AI 가상 피팅 결과입니다. 실제 착용감, 핏, 색감은
          이미지와 다를 수 있습니다.
        </p>
      </div>
    </div>
  );
}

export default ResultPanel;
