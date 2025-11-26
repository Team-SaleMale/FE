// src/components/Lab/ResultPanel.jsx
import React, { useState } from "react";
import ImageCompareSlider from "./ImageCompareSlider";

import LabWearBefore1 from "../../assets/img/Lab/Lab_wear_before1.png";
import LabWearBefore2 from "../../assets/img/Lab/Lab_wear_before2.png";
import LabWearResult from "../../assets/img/Lab/Lab_wear_result.png";

function ResultPanel({ mode, hasMockResult = false }) {
  const [view, setView] = useState("before"); // before | after | compare

  const isWear = mode === "wear";
  const isDecor = mode === "decor";

  const getPlaceholderText = () => {
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
  };

  // [핵심] 비교 탭에서 사용할 이미지 (지금은 mock)
  const compareBeforeImg = hasMockResult ? LabWearBefore1 : null;
  const compareAfterImg = hasMockResult ? LabWearResult : null;

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
              <ImageCompareSlider
                beforeLabel="원본 이미지"
                afterLabel={isWear ? "착용 이미지" : isDecor ? "배치 이미지" : "After"}
                beforeImage={compareBeforeImg}
                afterImage={compareAfterImg}
              />
            </div>
          </div>
        ) : (
          <div className="lab-result-placeholder">
            {/* BEFORE 뷰 */}
            {view === "before" && (
              <div className="lab-result-image lab-result-image--before">
                {hasMockResult ? (
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
                {hasMockResult ? (
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
        <p className="lab-result-note">
          ※ 현재는 예시 레이아웃만 제공되며, 실제 이미지는 AI API 연동 후 표시됩니다.
        </p>
      </div>
    </div>
  );
}

export default ResultPanel;
